// STATIC CANDIDATE ONLY: not executed, syntax-checked or tested by its author.
// Root must review and validate before use. No application modules are imported.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Transform } from "node:stream";

const UPSTREAM_HOST = "127.0.0.1";
const UPSTREAM_PORT = 8766;
const MAX_HEADER_BYTES = 32 * 1024;
const MAX_TARGET_BYTES = 8192;
const MAX_ACTIVE = 32;
const REQUEST_DEADLINE_MS = 90_000;
const SESSION_LIMIT_MS = 20 * 60_000;
const args = process.argv.slice(2);
const values = new Map();
for (let i = 0; i < args.length; i += 2) {
  if (!['--port', '--log-name'].includes(args[i]) || !args[i + 1] || values.has(args[i])) {
    throw new Error("Usage: node loopback-access-logger.mjs --port 18000..18999 --log-name UNIQUE.jsonl");
  }
  values.set(args[i], args[i + 1]);
}
const portText = values.get('--port') || '';
const logName = values.get('--log-name') || '';
if (!/^18\d{3}$/.test(portText) || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,90}\.jsonl$/.test(logName)) {
  throw new Error("An explicit port from 18000 through 18999 and a safe unique .jsonl filename are required");
}
const port = Number(portText);
const logDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'logs');
fs.mkdirSync(logDirectory, { recursive: true, mode: 0o700 });
const directoryStat = fs.lstatSync(logDirectory);
if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) {
  throw new Error("The candidate's logs path must be an ordinary directory");
}
// Exclusive create: no overwrite, append-to-old-run or symlink target reuse.
const logFd = fs.openSync(path.join(logDirectory, logName), 'wx', 0o600);
let logOpen = true;
let loggingFailed = false;
let stopping = false;
let acceptedRequests = 0;
const active = new Set();
// Includes HTTP sockets later detached for CONNECT/Upgrade handling.
const ownedSockets = new Set();

function scalar(header) {
  return typeof header === 'string' ? header : '';
}
function purpose(header) {
  const value = scalar(header).trim().toLowerCase();
  if (!value) return null;
  // Unknown text is not logged: these headers must not become a secret channel.
  return value.length <= 80 && /^(prefetch|prerender)(\s*;\s*(prefetch|prerender))*$/.test(value)
    ? value : 'other';
}
function enumHeader(header, allowed) {
  const value = scalar(header).trim().toLowerCase();
  return !value ? null : allowed.includes(value) ? value : 'other';
}
function targetInfo(raw = '') {
  const valid = Buffer.byteLength(raw) <= MAX_TARGET_BYTES && raw.startsWith('/') &&
    !raw.startsWith('//') && !/[\\#\u0000-\u0020\u007f]/.test(raw);
  if (!valid) return { valid: false, pathname: null, query_present: false, rsc_query_present: false };
  const marker = raw.indexOf('?');
  const pathname = marker < 0 ? raw : raw.slice(0, marker);
  const query = marker < 0 ? '' : raw.slice(marker + 1);
  return {
    valid: true,
    // Bounded pathname only. Never log raw targets, query values or full URLs.
    pathname: pathname.replace(/[^A-Za-z0-9/._~-]/g, '_').slice(0, 512),
    query_present: marker >= 0,
    rsc_query_present: new URLSearchParams(query).has('_rsc'),
  };
}
const hopByHop = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'proxy-connection', 'te', 'trailer', 'transfer-encoding', 'upgrade',
]);
function forwardedHeaders(headers, isRequest) {
  const blocked = new Set(hopByHop);
  for (const token of scalar(headers.connection).split(',')) {
    if (token.trim()) blocked.add(token.trim().toLowerCase());
  }
  const result = {};
  for (const [name, value] of Object.entries(headers)) {
    if (blocked.has(name) || value === undefined) continue;
    // The fixed upstream must never trust client-supplied forwarding identity.
    if (isRequest && (name === 'host' || name === 'forwarded' || name.startsWith('x-forwarded-'))) continue;
    result[name] = value;
  }
  if (isRequest) result.host = `${UPSTREAM_HOST}:${UPSTREAM_PORT}`;
  // Next's RSC/prefetch/router-state headers and query remain forwarded, not logged.
  return result;
}
function writeRecord(record) {
  if (!logOpen || loggingFailed) return;
  try {
    const bytes = Buffer.from(JSON.stringify(record) + '\n');
    let offset = 0;
    while (offset < bytes.length) {
      const written = fs.writeSync(logFd, bytes, offset, bytes.length - offset);
      if (written <= 0) throw new Error('Incomplete log write');
      offset += written;
    }
  } catch {
    loggingFailed = true;
    process.stderr.write('Measurement log failed; this run is incomplete. Stopping.\n');
    shutdown(74, 'log_failed');
  }
}
function begin(req) {
  const target = targetInfo(req.url);
  const started = performance.now();
  const record = {
    method: /^[A-Z]{1,16}$/.test(req.method || '') ? req.method : 'OTHER',
    pathname: target.pathname,
    query_present: target.query_present,
    rsc_query_present: target.rsc_query_present,
    started_at: new Date().toISOString(),
    finished_at: null,
    elapsed_ms: null,
    status: null,
    response_body_bytes: 0,
    purpose: purpose(req.headers.purpose),
    sec_purpose: purpose(req.headers['sec-purpose']),
    next_router_prefetch: enumHeader(req.headers['next-router-prefetch'], ['0', '1', '2', '3']),
    content_encoding: null,
    next_cache_status: null,
    completion: null,
  };
  let finished = false;
  return {
    record, target,
    finish(completion) {
      if (finished) return;
      finished = true;
      record.finished_at = new Date().toISOString();
      record.elapsed_ms = Math.round((performance.now() - started) * 1000) / 1000;
      record.completion = completion;
      writeRecord(record);
    },
  };
}
const server = http.createServer({ maxHeaderSize: MAX_HEADER_BYTES }, (req, res) => {
  const state = begin(req);
  let upstreamRequest;
  let upstreamResponse;
  let meter;
  let timer;
  let outcome = 'finished';
  let finished = false;
  const stopStreams = () => {
    upstreamRequest?.destroy();
    upstreamResponse?.destroy();
    meter?.destroy();
  };
  const finish = (completion) => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    active.delete(interrupt);
    state.finish(completion);
  };
  const interrupt = () => {
    finish('interrupted');
    stopStreams();
    res.destroy();
  };
  res.once('finish', () => finish(outcome));
  res.once('close', () => {
    if (!res.writableFinished) {
      finish(outcome === 'finished' ? 'client_aborted' : outcome);
      stopStreams();
    }
  });
  res.once('error', () => {
    finish('downstream_error');
    stopStreams();
  });
  function reject(status, completion) {
    outcome = completion;
    state.record.status = status;
    res.writeHead(status, { 'content-length': '0', 'cache-control': 'no-store', connection: 'close' });
    res.end();
  }
  if (!['GET', 'HEAD'].includes(req.method)) return reject(405, 'method_rejected');
  if (req.rawHeaders.length > 256) return reject(431, 'headers_rejected');
  if (!state.target.valid) return reject(400, 'target_rejected');
  if (req.headers.host !== `127.0.0.1:${port}`) return reject(400, 'host_rejected');
  if (req.headers['transfer-encoding'] ||
      (req.headers['content-length'] !== undefined && req.headers['content-length'] !== '0')) {
    return reject(400, 'body_rejected');
  }
  if (stopping || active.size >= MAX_ACTIVE || acceptedRequests >= 5000) {
    return reject(503, 'limit_rejected');
  }
  acceptedRequests++;
  active.add(interrupt);
  function fail(completion, status = 502) {
    if (finished || outcome !== 'finished') return;
    outcome = completion;
    stopStreams();
    if (!res.headersSent && !res.destroyed) reject(status, completion);
    else {
      finish(completion);
      res.destroy();
    }
  }
  timer = setTimeout(() => fail('deadline_exceeded', 504), REQUEST_DEADLINE_MS);
  try {
    upstreamRequest = http.request({
      hostname: UPSTREAM_HOST,
      port: UPSTREAM_PORT,
      method: req.method,
      path: req.url,
      headers: forwardedHeaders(req.headers, true),
      maxHeaderSize: MAX_HEADER_BYTES,
      agent: false,
    }, (upstream) => {
      if (finished || stopping) {
        upstream.destroy();
        return;
      }
      upstreamResponse = upstream;
      state.record.status = upstream.statusCode || 502;
      state.record.content_encoding = enumHeader(upstream.headers['content-encoding'], ['gzip', 'br', 'deflate', 'identity', 'zstd']);
      state.record.next_cache_status = enumHeader(upstream.headers['x-nextjs-cache'], ['hit', 'miss', 'stale', 'revalidated']);
      try {
        res.writeHead(state.record.status, forwardedHeaders(upstream.headers, false));
      } catch {
        fail('upstream_header_error');
        return;
      }
      meter = new Transform({
        highWaterMark: 64 * 1024,
        transform(chunk, encoding, callback) {
          // HTTP framing is already removed; content encoding is not decompressed.
          // Observed body bytes are not proof of downstream/browser consumption.
          state.record.response_body_bytes += chunk.length;
          callback(null, chunk);
        },
      });
      meter.once('error', () => fail('stream_error'));
      upstream.once('aborted', () => fail('upstream_aborted'));
      upstream.once('error', () => fail('upstream_error'));
      upstream.pipe(meter).pipe(res);
    });
    upstreamRequest.once('error', () => {
      if (outcome === 'finished') fail('upstream_unavailable');
    });
    upstreamRequest.setTimeout(30_000, () => fail('upstream_idle_timeout', 504));
    req.once('aborted', () => {
      finish('client_aborted');
      stopStreams();
      res.destroy();
    });
    req.once('error', () => {
      finish('client_error');
      stopStreams();
      res.destroy();
    });
    upstreamRequest.end();
  } catch {
    fail('upstream_request_error');
  }
});
// Reject excess fields explicitly instead of silently truncating routing headers.
// Parsing remains bounded by maxHeaderSize; rawHeaders counts the original fields.
server.maxHeadersCount = 0;
server.headersTimeout = 10_000;
server.requestTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 100;
server.maxConnections = 64;
server.on('connection', (socket) => {
  ownedSockets.add(socket);
  socket.once('close', () => ownedSockets.delete(socket));
  if (stopping) socket.destroy();
});
// CONNECT and Upgrade have separate Node events; neither may create a tunnel.
for (const event of ['connect', 'upgrade']) {
  server.on(event, (req, socket) => {
    socket.once('error', () => socket.destroy());
    const state = begin(req);
    state.record.status = 405;
    state.finish('protocol_rejected');
    // end() alone can leave a detached half-open socket alive. Destroy both
    // directions after the rejection is flushed, or at this bounded deadline.
    const rejectionTimer = setTimeout(() => socket.destroy(), 250);
    rejectionTimer.unref();
    socket.once('close', () => clearTimeout(rejectionTimer));
    socket.end(
      'HTTP/1.1 405 Method Not Allowed\r\nConnection: close\r\nContent-Length: 0\r\n\r\n',
      () => socket.destroy(),
    );
  });
}
server.on('clientError', (_error, socket) => {
  // No raw parser error or packet is logged: it could contain confidential input.
  process.stderr.write('A malformed request was rejected before request logging.\n');
  socket.destroy();
});
let sessionTimer;
function closeLog() {
  if (!logOpen) return;
  logOpen = false;
  try { fs.fsyncSync(logFd); fs.closeSync(logFd); }
  catch { process.stderr.write('Log finalization failed; this run is incomplete.\n'); process.exitCode = 74; }
}
function shutdown(code, reason) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  clearTimeout(sessionTimer);
  process.stderr.write(`Proxy stopping: ${reason}. Review interrupted/error records.\n`);
  for (const interrupt of [...active]) interrupt();
  server.close(closeLog);
  server.closeAllConnections();
  // closeAllConnections does not cover sockets upgraded out of HTTP handling.
  for (const socket of ownedSockets) socket.destroy();
}
server.once('error', () => shutdown(70, 'listener_failed'));
process.once('SIGINT', () => shutdown(130, 'signal_interrupt'));
process.once('SIGTERM', () => shutdown(143, 'signal_termination'));
server.listen(port, UPSTREAM_HOST, () => {
  process.stdout.write(`Loopback measurement listening on port ${port}; fixed upstream port ${UPSTREAM_PORT}; log ${logName}.\n`);
  sessionTimer = setTimeout(() => shutdown(124, 'session_time_limit'), SESSION_LIMIT_MS);
});
