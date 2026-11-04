// STATIC CANDIDATE: its author has not executed or syntax-checked this harness.
// Root must independently review before running. No app modules are imported.
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawn } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOGGER = path.resolve(HERE, '../../revision-2/loopback-access-logger.mjs');
const LOGGER_SHA256 = '5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512';
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--port-base' || !/^18\d{3}$/.test(args[1])) {
  throw new Error('Usage: trusted-node run-acceptance.mjs --port-base 18000..18995');
}
const base = Number(args[1]);
if (base > 18995) throw new Error('Port base must leave five additional allowed ports');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256(fs.readFileSync(LOGGER)), LOGGER_SHA256, 'Pinned logger changed; refusing to execute');
const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8);
const runDirectory = path.join(HERE, 'runs', runId);
fs.mkdirSync(runDirectory, { recursive: true, mode: 0o700 });
const eventFd = fs.openSync(path.join(runDirectory, 'assertions.jsonl'), 'wx', 0o600);
fs.writeFileSync(path.join(runDirectory, 'run.json'), JSON.stringify({
  runId, startedAt: new Date().toISOString(), status: 'running',
  loggerSha256: LOGGER_SHA256, nodeVersion: process.version,
  upstream: '127.0.0.1:8766', proxyPorts: [base, base + 1, base + 2, base + 3, base + 4, base + 5],
  scope: 'Synthetic loopback acceptance only; no application or browser execution',
}, null, 2) + '\n', { flag: 'wx', mode: 0o600 });

const results = [];
const children = new Set();
const rawSockets = new Set();
const fixtureSockets = new Set();
const serverSockets = new Set();
const ownedServers = new Set();
const pendingAcquisitions = new Set();
const clientRequests = new Set();
const readyByPort = new Map();
const fixtureRequests = [];
const fixtureCompleted = new Set();
let fixture;
let cleanupPromise;
let finalizationPromise;
let eventLogOpen = true;
let fatal = null;
let stopping = false;
function ensureRunning() {
  if (stopping) throw new Error('Harness stopping; no new test or resource acquisition permitted');
}
const sentinel = 'SYNTHETIC_PRIVATE_SENTINEL_' + randomUUID().replaceAll('-', '');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function writeEvent(record) {
  if (eventLogOpen) fs.writeSync(eventFd, JSON.stringify(record) + '\n');
}
async function until(predicate, ms = 4000, label = 'condition') {
  const deadline = performance.now() + ms;
  while (performance.now() < deadline) {
    ensureRunning();
    const value = await predicate();
    if (value) return value;
    await wait(25);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function test(name, task) {
  ensureRunning();
  const startedAt = new Date().toISOString();
  const started = performance.now();
  try {
    await task();
    ensureRunning();
    const result = { name, status: 'passed', startedAt, elapsedMs: Math.round(performance.now() - started) };
    results.push(result); writeEvent(result);
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    if (stopping) throw error;
    const result = {
      name, status: 'failed', startedAt, elapsedMs: Math.round(performance.now() - started),
      // Test inputs are synthetic. Avoid dumping arbitrary error objects/headers.
      failure: String(error?.message || error).slice(0, 2000),
    };
    results.push(result); writeEvent(result);
    process.stderr.write(`FAIL ${name}: ${result.failure}\n`);
  }
}
function listen(server, port) {
  ensureRunning();
  ownedServers.add(server);
  server.on('connection', (socket) => {
    serverSockets.add(socket);
    socket.once('close', () => serverSockets.delete(socket));
    socket.once('error', () => socket.destroy());
    // Probe listeners never accept application traffic or keep a client alive.
    if (stopping || !(server instanceof http.Server)) socket.destroy();
  });
  server.once('close', () => ownedServers.delete(server));
  const operation = new Promise((resolve, reject) => {
    const failed = (error) => { ownedServers.delete(server); reject(error); };
    server.once('error', failed);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', failed);
      if (stopping) {
        server.close(() => reject(new Error('Stopped during listener acquisition')));
        return;
      }
      resolve();
    });
  });
  pendingAcquisitions.add(operation);
  operation.then(() => pendingAcquisitions.delete(operation), () => pendingAcquisitions.delete(operation));
  return operation;
}
async function closeServer(server) {
  if (!server?.listening) return;
  await new Promise((resolve) => server.close(resolve));
}
async function requireFreeProxyPorts() {
  // Own temporary listeners only; do not inspect, signal or replace occupants.
  const probes = [];
  try {
    for (let port = base; port <= base + 5; port++) {
      const probe = net.createServer();
      probes.push(probe);
      try { await listen(probe, port); }
      catch { throw new Error(`Required proxy port ${port} is occupied or unavailable; refusing to continue`); }
    }
  } finally {
    await Promise.all(probes.map(closeServer));
  }
}

const plainBody = Buffer.from('Synthetic fixture body only.\n'.repeat(128));
const compressedBody = gzipSync(plainBody);
const streamParts = [Buffer.alloc(16_384, 65), Buffer.alloc(16_384, 66), Buffer.alloc(16_384, 67)];
async function startFixture() {
  ensureRunning();
  fixture = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1:8766').pathname;
    fixtureRequests.push({ pathname, target: req.url, method: req.method, headers: { ...req.headers } });
    if (pathname === '/idle' || pathname === '/interrupt-active') return;
    if (pathname === '/upstream-abort') {
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      res.write(Buffer.from('synthetic-partial-body'));
      const timer = setTimeout(() => res.socket?.destroy(), 100);
      res.once('close', () => clearTimeout(timer));
      return;
    }
    if (pathname === '/downstream-abort') {
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      let sent = 0;
      const timer = setInterval(() => {
        if (++sent <= 100) res.write(Buffer.alloc(16_384, 68));
        else { clearInterval(timer); res.end(); }
      }, 30);
      res.once('close', () => clearInterval(timer));
      return;
    }
    if (pathname === '/stream') {
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      res.write(streamParts[0]);
      const second = setTimeout(() => res.write(streamParts[1]), 300);
      const final = setTimeout(() => {
        res.end(streamParts[2]);
        fixtureCompleted.add(pathname);
      }, 900);
      res.once('close', () => { clearTimeout(second); clearTimeout(final); });
      return;
    }
    if (pathname === '/gzip') {
      res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-encoding': 'gzip', 'content-length': compressedBody.length, 'x-nextjs-cache': 'HIT' });
      res.end(compressedBody); return;
    }
    if (pathname === '/not-modified') {
      res.writeHead(304, { etag: '"synthetic-v1"', 'x-nextjs-cache': 'STALE' });
      res.end(); return;
    }
    if (pathname === '/hop') {
      res.writeHead(200, { connection: 'close, x-fixture-hop', 'x-fixture-hop': sentinel, 'x-end-to-end': 'retained' });
      res.end('hop-ok'); return;
    }
    res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': plainBody.length });
    res.end(req.method === 'HEAD' ? undefined : plainBody);
  });
  fixture.on('connection', (socket) => {
    fixtureSockets.add(socket);
    socket.once('close', () => fixtureSockets.delete(socket));
  });
  try { await listen(fixture, 8766); }
  catch { throw new Error('Required fixture port 8766 is occupied or unavailable; refusing to stop or replace its owner'); }
}
async function stopFixture() {
  if (!fixture) return;
  for (const socket of fixtureSockets) socket.destroy();
  await closeServer(fixture);
}
function records(handle) {
  if (!fs.existsSync(handle.logPath)) return [];
  const text = fs.readFileSync(handle.logPath, 'utf8');
  const lines = text.split('\n');
  lines.pop(); // An incomplete final line is not a completed record.
  return lines.filter(Boolean).map((line) => JSON.parse(line));
}
function recordFor(handle, pathname, completion = null) {
  return until(() => records(handle).find((record) => record.pathname === pathname && (!completion || record.completion === completion)), 5000, `log record ${pathname}`);
}
function launch(label, port, overrides = null, expectedExitCode = 143) {
  ensureRunning();
  assert.equal(sha256(fs.readFileSync(LOGGER)), LOGGER_SHA256, 'Pinned logger changed before child launch');
  const logName = `accept-${runId}-${label}.jsonl`;
  const argv = overrides || ['--port', String(port), '--log-name', logName];
  const child = spawn(process.execPath, [LOGGER, ...argv], { stdio: ['ignore', 'pipe', 'pipe'] });
  const handle = {
    child, label, port, logName,
    logPath: path.resolve(path.dirname(LOGGER), 'logs', logName),
    stdout: '', stderr: '', exit: null, closed: false,
    expectedExitCode, expectedRecords: [],
  };
  children.add(handle);
  for (const stream of ['stdout', 'stderr']) {
    child[stream].on('data', (chunk) => {
      handle[stream] += chunk.toString('utf8');
      if (Buffer.byteLength(handle[stream]) > 1_048_576) child.kill('SIGTERM');
    });
  }
  handle.exited = new Promise((resolve) => {
    child.once('error', (error) => {
      handle.exit = { code: null, signal: null, spawnError: error.code || 'spawn_error' };
      resolve(handle.exit);
    });
    child.once('exit', (code, signal) => { handle.exit = { code, signal }; resolve(handle.exit); });
  });
  // 'close' follows process exit and draining of stdout/stderr pipes.
  handle.closedPromise = new Promise((resolve) => child.once('close', (code, signal) => {
    handle.closed = true;
    handle.closeResult = { code, signal };
    if (readyByPort.get(port) === handle) readyByPort.delete(port);
    resolve(handle.closeResult);
  }));
  return handle;
}
async function ready(handle) {
  await until(() => {
    if (handle.exit) throw new Error(`Owned logger ${handle.label} exited before ready`);
    return handle.stdout.includes(`Loopback measurement listening on port ${handle.port};`);
  }, 5000, `owned logger ${handle.label} readiness`);
  ensureRunning();
  readyByPort.set(handle.port, handle);
  return handle;
}
async function stopChild(handle, boundMs = 2000) {
  if (handle.closed) return { bounded: true, exit: handle.closeResult, closed: true };
  if (!handle.exit) handle.child.kill('SIGTERM');
  const bounded = await Promise.race([handle.closedPromise.then(() => true), wait(boundMs).then(() => false)]);
  if (!bounded) {
    handle.child.kill('SIGKILL'); // Only this harness's own spawned process.
    await Promise.race([handle.closedPromise, wait(2000)]);
  }
  return { bounded, exit: handle.closeResult || handle.exit, closed: handle.closed };
}
function expectedPath(raw) {
  if (Buffer.byteLength(raw) > 8192 || !raw.startsWith('/') || raw.startsWith('//') || /[\\#\u0000-\u0020\u007f]/.test(raw)) return null;
  return raw.split('?')[0].replace(/[^A-Za-z0-9/._~-]/g, '_').slice(0, 512);
}
function request(port, pathname, options = {}) {
  ensureRunning();
  const logger = readyByPort.get(port);
  if (logger && !options.expectNoRecord) logger.expectedRecords.push({ method: options.method || 'GET', pathname: expectedPath(pathname) });
  return new Promise((resolve) => {
    let settled = false;
    let status = null;
    let headers = {};
    const parts = [];
    let length = 0;
    let firstChunkAt = null;
    const began = performance.now();
    const finish = (complete, error = null) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      resolve({ status, headers, body: Buffer.concat(parts), complete, error, elapsedMs: performance.now() - began, firstChunkAt });
    };
    const req = http.request({
      hostname: '127.0.0.1', port, method: options.method || 'GET', path: pathname,
      headers: { host: `127.0.0.1:${port}`, ...(options.headers || {}) }, agent: false,
    }, (res) => {
      status = res.statusCode; headers = res.headers;
      res.on('data', (chunk) => {
        firstChunkAt ??= performance.now();
        length += chunk.length;
        if (length > 4 * 1024 * 1024) { req.destroy(); res.destroy(); finish(false, 'fixture_body_limit'); return; }
        parts.push(chunk);
        options.onChunk?.(chunk);
        if (options.abortAfterFirstChunk) { res.destroy(); req.destroy(); finish(false, 'intentional_client_abort'); }
      });
      res.once('end', () => finish(true));
      res.once('aborted', () => finish(false, 'response_aborted'));
      res.once('error', () => finish(false, 'response_error'));
    });
    clientRequests.add(req);
    req.once('close', () => clientRequests.delete(req));
    const timer = setTimeout(() => { req.destroy(); finish(false, 'client_deadline'); }, options.timeoutMs || 7000);
    req.once('error', (error) => finish(false, error.code || 'request_error'));
    req.end(options.body);
  });
}
async function openHalfOpenProtocol(handle, method) {
  ensureRunning();
  const socket = net.createConnection({ host: '127.0.0.1', port: handle.port, allowHalfOpen: true });
  rawSockets.add(socket);
  socket.once('close', () => rawSockets.delete(socket));
  let text = '';
  let ended = false;
  let error = null;
  socket.on('data', (chunk) => {
    text += chunk.toString('latin1');
    if (text.length > 4096) { error = 'unexpected_response_size'; socket.destroy(); }
  });
  socket.once('end', () => { ended = true; });
  socket.once('error', (value) => { error = value.code || 'socket_error'; });
  socket.setTimeout(5000, () => socket.destroy());
  await until(() => !socket.connecting || error, 2000, 'raw protocol connection');
  assert.equal(error, null);
  const target = method === 'CONNECT' ? '127.0.0.1:8766' : '/upgrade-case';
  handle.expectedRecords.push({ method, pathname: expectedPath(target) });
  const extra = method === 'CONNECT' ? '' : 'Connection: Upgrade\r\nUpgrade: websocket\r\n';
  socket.write(`${method} ${target} HTTP/1.1\r\nHost: 127.0.0.1:${handle.port}\r\n${extra}\r\n`);
  await until(() => text.includes('\r\n\r\n') || error, 2000, 'protocol rejection');
  assert.match(text, /^HTTP\/1\.1 405 /);
  // Do not end the client's write side: this is the original half-open risk.
  return { socket, remoteEnded: () => ended, socketError: () => error };
}

async function main() {
  await requireFreeProxyPorts();
  await startFixture(); // Fails closed if a real Next server still owns 8766.
  const mainLogger = await ready(launch('main', base));

  await test('GET exact body parity and dechunked byte count', async () => {
    const response = await request(base, '/plain');
    assert.equal(response.status, 200); assert.equal(response.complete, true);
    assert.deepEqual(response.body, plainBody);
    const record = await recordFor(mainLogger, '/plain', 'finished');
    assert.equal(record.response_body_bytes, plainBody.length);
  });
  await test('HEAD has no body while preserving representation Content-Length', async () => {
    const response = await request(base, '/head', { method: 'HEAD' });
    assert.equal(response.status, 200); assert.equal(response.complete, true);
    assert.equal(response.body.length, 0); assert.equal(Number(response.headers['content-length']), plainBody.length);
    assert.equal((await recordFor(mainLogger, '/head', 'finished')).response_body_bytes, 0);
  });
  await test('Chunked response streams before completion and preserves exact bytes', async () => {
    let observedBeforeFixtureEnd = false;
    const response = await request(base, '/stream', { onChunk: () => { observedBeforeFixtureEnd ||= !fixtureCompleted.has('/stream'); } });
    assert.equal(response.complete, true); assert.equal(observedBeforeFixtureEnd, true);
    assert.deepEqual(response.body, Buffer.concat(streamParts));
    assert.equal((await recordFor(mainLogger, '/stream', 'finished')).response_body_bytes, response.body.length);
  });
  await test('Compressed bytes, encoding and known cache metadata remain intact', async () => {
    const response = await request(base, '/gzip');
    assert.equal(response.complete, true); assert.equal(response.headers['content-encoding'], 'gzip');
    assert.deepEqual(response.body, compressedBody);
    const record = await recordFor(mainLogger, '/gzip', 'finished');
    assert.equal(record.response_body_bytes, compressedBody.length);
    assert.equal(record.content_encoding, 'gzip'); assert.equal(record.next_cache_status, 'hit');
  });
  await test('304 response has zero body and separate status/cache metadata', async () => {
    const response = await request(base, '/not-modified');
    assert.equal(response.complete, true); assert.equal(response.status, 304); assert.equal(response.body.length, 0);
    const record = await recordFor(mainLogger, '/not-modified', 'finished');
    assert.equal(record.status, 304); assert.equal(record.response_body_bytes, 0); assert.equal(record.next_cache_status, 'stale');
  });
  await test('Concurrent independent GET responses remain correct', async () => {
    const responses = await Promise.all(['/concurrent-a', '/concurrent-b'].map((p) => request(base, p)));
    for (const response of responses) { assert.equal(response.complete, true); assert.deepEqual(response.body, plainBody); }
    await recordFor(mainLogger, '/concurrent-a', 'finished'); await recordFor(mainLogger, '/concurrent-b', 'finished');
  });
  await test('Next flags absent/0/1/2/3 forward unchanged while private sentinels never enter logs', async () => {
    for (const flag of [undefined, '0', '1', '2', '3', sentinel]) {
      const suffix = flag === undefined ? 'absent' : flag === sentinel ? 'unexpected' : flag;
      const pathname = '/flag-' + suffix;
      const headers = {
        cookie: 'synthetic=' + sentinel, authorization: 'Bearer ' + sentinel,
        'next-router-state-tree': JSON.stringify([sentinel]), rsc: '1',
        purpose: 'prefetch', 'sec-purpose': 'prefetch; prerender',
      };
      if (flag !== undefined) headers['next-router-prefetch'] = flag;
      const target = pathname + '?private=' + sentinel + '&_rsc=' + sentinel;
      const response = await request(base, target, { headers });
      assert.equal(response.complete, true); assert.equal(response.status, 200);
      const seen = fixtureRequests.find((entry) => entry.pathname === pathname);
      assert.ok(seen); assert.equal(seen.target, target);
      for (const [name, value] of Object.entries(headers)) assert.equal(seen.headers[name], value, `Forwarded synthetic header ${name}`);
      const record = await recordFor(mainLogger, pathname, 'finished');
      assert.equal(record.next_router_prefetch, flag === undefined ? null : flag === sentinel ? 'other' : flag);
      assert.equal(record.query_present, true); assert.equal(record.rsc_query_present, true);
      assert.equal(record.purpose, 'prefetch'); assert.equal(record.sec_purpose, 'prefetch; prerender');
      assert.equal(fs.readFileSync(mainLogger.logPath, 'utf8').includes(sentinel), false);
      assert.equal(mainLogger.stdout.includes(sentinel) || mainLogger.stderr.includes(sentinel), false);
    }
  });
  await test('Connection-nominated hop headers are stripped both ways; end-to-end header stays', async () => {
    const response = await request(base, '/hop', { headers: { connection: 'close, x-request-hop', 'x-request-hop': sentinel } });
    assert.equal(response.complete, true); assert.equal(response.headers['x-fixture-hop'], undefined);
    assert.equal(response.headers['x-end-to-end'], 'retained');
    assert.equal(fixtureRequests.find((entry) => entry.pathname === '/hop').headers['x-request-hop'], undefined);
  });
  await test('Methods, bodies, targets, Host and field-count violations do not reach upstream', async () => {
    const before = fixtureRequests.length;
    const cases = [
      ['/bad-method', { method: 'POST' }, 405],
      ['/bad-body', { headers: { 'content-length': '3' }, body: 'abc' }, 400],
      ['http://127.0.0.1:8766/absolute?secret=' + sentinel, {}, 400],
      ['//127.0.0.1:8766/protocol-relative', {}, 400],
      ['/bad-host', { headers: { host: 'wrong.invalid' } }, 400],
      ['/' + 'a'.repeat(9000), {}, 400],
      ['/many-headers', { headers: Object.fromEntries(Array.from({ length: 129 }, (_, i) => ['x-count-' + i, 'synthetic'])) }, 431],
    ];
    for (const [target, options, expected] of cases) {
      const response = await request(base, target, options);
      assert.equal(response.status, expected); assert.equal(response.complete, true);
    }
    assert.equal(fixtureRequests.length, before);
    assert.equal(fs.readFileSync(mainLogger.logPath, 'utf8').includes(sentinel), false);
  });
  await test('Oversized header is rejected before forwarding without raw-packet logging', async () => {
    const before = fixtureRequests.length;
    const response = await request(base, '/oversized-header', { expectNoRecord: true, headers: { 'x-overflow': 'synthetic'.repeat(6000) } });
    assert.equal(response.complete, false); assert.equal(fixtureRequests.length, before);
    await until(() => mainLogger.stderr.includes('A malformed request was rejected before request logging.'), 2000, 'fixed parser warning');
    assert.equal(mainLogger.stderr.includes('synthetic'.repeat(20)), false);
  });
  await test('Upstream partial-body abort is not reported as a successful full response', async () => {
    const response = await request(base, '/upstream-abort');
    assert.equal(response.complete, false);
    const record = await recordFor(mainLogger, '/upstream-abort');
    assert.ok(['upstream_aborted', 'upstream_error'].includes(record.completion));
    assert.ok(record.response_body_bytes > 0); assert.equal(record.status, 200);
  });
  await test('Downstream abort is classified with partial observed-body bytes', async () => {
    const response = await request(base, '/downstream-abort', { abortAfterFirstChunk: true });
    assert.equal(response.complete, false);
    const record = await recordFor(mainLogger, '/downstream-abort');
    assert.equal(record.completion, 'client_aborted');
    assert.ok(record.response_body_bytes > 0 && record.response_body_bytes < 100 * 16_384);
  });
  await test('One real upstream idle timeout returns classified 504 after approximately 30 seconds', async () => {
    const response = await request(base, '/idle', { timeoutMs: 38_000 });
    assert.equal(response.complete, true); assert.equal(response.status, 504);
    const record = await recordFor(mainLogger, '/idle', 'upstream_idle_timeout');
    assert.equal(record.response_body_bytes, 0);
    assert.ok(record.elapsed_ms >= 29_000 && record.elapsed_ms <= 37_000, 'Timeout outside deliberately broad scheduling bounds');
  });

  for (const [index, method] of ['CONNECT', 'GET'].entries()) {
    await test(`${method === 'GET' ? 'Upgrade' : 'CONNECT'} half-open rejection and bounded owned-process shutdown`, async () => {
      const logger = await ready(launch(method === 'GET' ? 'upgrade' : 'connect', base + index + 1));
      const before = fixtureRequests.length;
      const connection = await openHalfOpenProtocol(logger, method);
      await until(() => connection.remoteEnded() || connection.socketError(), 1500, 'rejected protocol EOF');
      assert.equal(fixtureRequests.length, before);
      await until(() => records(logger).some((record) => record.completion === 'protocol_rejected' && record.status === 405));
      const stopped = await stopChild(logger, 1500);
      assert.equal(stopped.bounded, true, 'Required SIGKILL: detached socket kept logger alive');
      assert.equal(stopped.exit?.code, 143);
      connection.socket.destroy();
      const probe = net.createServer();
      await listen(probe, logger.port); await closeServer(probe);
    });
  }
  for (const [index, method] of ['CONNECT', 'GET'].entries()) {
    await test(`${method === 'GET' ? 'Upgrade' : 'CONNECT'} immediate signal with client write side deliberately left open`, async () => {
      const logger = await ready(launch(method === 'GET' ? 'upgrade-interrupt' : 'connect-interrupt', base + index + 4));
      const before = fixtureRequests.length;
      const connection = await openHalfOpenProtocol(logger, method);
      // Do not await remote EOF and do not close/end the client's write side.
      const stopped = await stopChild(logger, 1500);
      assert.equal(stopped.bounded, true, 'Protocol interruption needed forced termination');
      assert.equal(stopped.exit?.code, 143);
      assert.equal(fixtureRequests.length, before);
      assert.ok(records(logger).some((record) => record.completion === 'protocol_rejected'));
      connection.socket.destroy();
    });
  }
  await test('Signal during an active ordinary request records interruption and exits without force kill', async () => {
    const logger = await ready(launch('interrupted', base + 3));
    const pending = request(logger.port, '/interrupt-active');
    await until(() => fixtureRequests.some((entry) => entry.pathname === '/interrupt-active'));
    const stopped = await stopChild(logger, 1500);
    assert.equal(stopped.bounded, true); assert.equal(stopped.exit?.code, 143);
    assert.equal((await pending).complete, false);
    const record = records(logger).find((entry) => entry.pathname === '/interrupt-active');
    assert.equal(record?.completion, 'interrupted'); assert.equal(record?.status, null);
  });
  await test('Duplicate log name refuses without overwriting or appending the original', async () => {
    const before = fs.readFileSync(mainLogger.logPath);
    const duplicate = launch('duplicate', base + 4, ['--port', String(base + 4), '--log-name', mainLogger.logName], 1);
    await until(() => duplicate.exit, 3000, 'duplicate-name child exit');
    assert.equal(duplicate.exit.code, 1); assert.equal(duplicate.exit.signal, null);
    assert.match(duplicate.stderr, /EEXIST/); assert.equal(duplicate.stdout.includes('listening'), false);
    assert.deepEqual(fs.readFileSync(mainLogger.logPath), before);
  });
  await test('Invalid port and filename reject before any listener starts', async () => {
    for (const [label, argv] of [
      ['invalid-port', ['--port', '17999', '--log-name', 'synthetic-invalid.jsonl']],
      ['invalid-name', ['--port', String(base + 4), '--log-name', '../synthetic-escape.jsonl']],
    ]) {
      const child = launch(label, base + 4, argv, 1);
      await until(() => child.exit, 3000, 'invalid-argument child exit');
      assert.equal(child.exit.code, 1); assert.equal(child.exit.signal, null);
      assert.match(child.stderr, /An explicit port/); assert.equal(child.stdout.includes('listening'), false);
    }
  });
  await test('Occupied owned listener refuses without displacing the existing logger', async () => {
    const child = launch('occupied', base, null, 70);
    await until(() => child.exit, 3000, 'occupied-port child exit');
    assert.equal(child.exit.code, 70); assert.equal(child.stdout.includes('listening'), false);
    assert.equal((await request(base, '/still-owned')).status, 200);
  });
  await test('Unavailable fixed upstream produces a classified 502', async () => {
    await stopFixture();
    const response = await request(base, '/unavailable');
    assert.equal(response.complete, true); assert.equal(response.status, 502);
    assert.equal((await recordFor(mainLogger, '/unavailable')).completion, 'upstream_unavailable');
  });
  await test('Logger remains pinned and all logger output remains sentinel-free', async () => {
    assert.equal(sha256(fs.readFileSync(LOGGER)), LOGGER_SHA256);
    for (const child of children) {
      if (fs.existsSync(child.logPath)) assert.equal(fs.readFileSync(child.logPath, 'utf8').includes(sentinel), false);
      assert.equal(child.stdout.includes(sentinel) || child.stderr.includes(sentinel), false);
    }
  });
}

async function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  let deadline;
  const stopSocketsAndServers = () => {
    for (const socket of rawSockets) socket.destroy();
    for (const request of clientRequests) request.destroy();
    for (const socket of serverSockets) socket.destroy();
    for (const socket of fixtureSockets) socket.destroy();
    for (const server of ownedServers) {
      try { server.close(() => {}); } catch { /* This is still an owned listener. */ }
    }
  };
  stopSocketsAndServers();
  const quiescence = (async () => {
    const exits = await Promise.all([...children].map(async (child) => ({ label: child.label, ...(await stopChild(child)) })));
    await Promise.allSettled([...pendingAcquisitions]);
    stopSocketsAndServers();
    // The independent cleanup deadline bounds this wait, including probe
    // listeners and accepted sockets that have not emitted close yet.
    while (ownedServers.size || serverSockets.size || rawSockets.size || clientRequests.size) await wait(10);
    return { exits, issues: [] };
  })();
  const bounded = new Promise((resolve) => {
    deadline = setTimeout(() => {
      stopSocketsAndServers();
      for (const child of children) if (!child.closed) child.child.kill('SIGKILL');
      resolve({
        exits: [...children].map((child) => ({ label: child.label, bounded: child.closed, closed: child.closed, exit: child.closeResult || child.exit })),
        issues: ['Cleanup exceeded its independent eight-second deadline; remaining owned resources were forcibly closed'],
      });
    }, 8000);
  });
  cleanupPromise = Promise.race([quiescence, bounded]).finally(() => clearTimeout(deadline));
  return cleanupPromise;
}
function preserveAndAuditEvidence() {
  const issues = [];
  for (const child of children) {
    // Preserve drained output before deciding whether the run can pass.
    for (const stream of ['stdout', 'stderr']) {
      fs.writeFileSync(path.join(runDirectory, `${child.label}.${stream}.txt`), child[stream], { flag: 'wx', mode: 0o600 });
    }
    if (!child.closed) issues.push(`${child.label}: child close/stdio drain was not established`);
    if (child.exit?.spawnError || child.closeResult?.code !== child.expectedExitCode || child.closeResult?.signal !== null) {
      issues.push(`${child.label}: unexpected exit; expected code ${child.expectedExitCode}, received code ${child.closeResult?.code ?? 'unknown'} and signal ${child.closeResult?.signal ?? 'none/unknown'}`);
    }
    let parsed = [];
    if (fs.existsSync(child.logPath)) {
      const bytes = fs.readFileSync(child.logPath);
      fs.copyFileSync(child.logPath, path.join(runDirectory, child.label + '.logger.jsonl'), fs.constants.COPYFILE_EXCL);
      const text = bytes.toString('utf8');
      if (text && !text.endsWith('\n')) issues.push(`${child.label}: incomplete final JSONL record`);
      try { parsed = text.split('\n').filter(Boolean).map((line) => JSON.parse(line)); }
      catch { issues.push(`${child.label}: malformed JSONL evidence`); }
      if (text.includes(sentinel)) issues.push(`${child.label}: synthetic private sentinel leaked into logger evidence`);
    } else if (child.expectedRecords.length) {
      issues.push(`${child.label}: expected logger evidence file is missing`);
    }
    if (child.stdout.includes(sentinel) || child.stderr.includes(sentinel)) issues.push(`${child.label}: synthetic private sentinel leaked into child output`);
    const counts = (entries) => {
      const values = new Map();
      for (const entry of entries) {
        const key = JSON.stringify([entry.method, entry.pathname]);
        values.set(key, (values.get(key) || 0) + 1);
      }
      return [...values].sort(([a], [b]) => a.localeCompare(b));
    };
    if (JSON.stringify(counts(parsed)) !== JSON.stringify(counts(child.expectedRecords))) {
      issues.push(`${child.label}: completed log-record counts do not match the requests this harness made`);
    }
    for (const entry of parsed) {
      if (typeof entry.completion !== 'string' || !entry.completion || !Number.isSafeInteger(entry.response_body_bytes) || entry.response_body_bytes < 0) {
        issues.push(`${child.label}: incomplete completion/body-byte fields in a log record`);
      }
    }
  }
  return issues;
}
function finalize(reason = null, requestedCode = null) {
  if (finalizationPromise) return finalizationPromise;
  // This synchronous gate precedes cleanup's snapshots. All acquisition paths
  // check it, including code resumed after an interrupted test or await.
  stopping = true;
  finalizationPromise = (async () => {
  clearTimeout(watchdog);
  let exits = [];
  let cleanupIssues = [];
  let evidenceIssues = [];
  try {
    const cleaned = await cleanup();
    exits = cleaned.exits; cleanupIssues = cleaned.issues;
    evidenceIssues = preserveAndAuditEvidence();
  }
  catch (error) { fatal = 'Cleanup or evidence preservation failed: ' + String(error?.message || error).slice(0, 500); }
  const failed = results.filter((entry) => entry.status === 'failed');
  const forced = exits.filter((entry) => !entry.bounded);
  const status = reason || fatal || cleanupIssues.length ? 'incomplete' : failed.length || forced.length || evidenceIssues.length ? 'failed' : 'passed_exercised_cases';
  const report = {
    runId, finishedAt: new Date().toISOString(), status, reason, fatal,
    passedCases: results.filter((entry) => entry.status === 'passed').length,
    failedCases: failed.length, cases: results, ownedChildExits: exits, cleanupIssues, evidenceIssues,
    loggerSha256: LOGGER_SHA256,
    notExercised: [
      'Ninety-second total request deadline', 'Twenty-minute session expiry',
      'Log-write or fsync/disk-full failures', 'Abrupt SIGKILL/power-loss durability',
      'Concurrency-limit exhaustion and five-thousand-request admission limit',
      'Overlapping slow-stream/backpressure stress; concurrent fast GETs alone do not prove this',
      'Real Next/browser journeys, production transfer savings and cold-tap UX',
    ],
    limitations: [
      'Synthetic loopback acceptance, not application, browser, mobile or benchmark evidence',
      'The idle-timeout case is established only if its executed case result says passed; total-deadline/session-expiry checks are outside this suite',
      'Log-write/disk-failure paths and abrupt SIGKILL durability are not certified',
      'Protocol cases inspect EOF and owned-process shutdown; client-side half-open TCP state alone does not prove server handle state',
    ],
  };
  fs.writeFileSync(path.join(runDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  writeEvent({ event: 'final', status, reason, fatal });
  fs.fsyncSync(eventFd); fs.closeSync(eventFd); eventLogOpen = false;
  process.stdout.write(`Acceptance run ${status}; evidence directory: ${runDirectory}\n`);
  process.exitCode = requestedCode ?? (status === 'passed_exercised_cases' ? 0 : 1);
  // Cleanup timeout is already an incomplete result. Do not leave this harness's
  // own lingering handles alive after its evidence has been written.
  if (cleanupIssues.length) setImmediate(() => process.exit(process.exitCode || 1));
  })();
  return finalizationPromise;
}
const watchdog = setTimeout(() => {
  finalize('harness_deadline', 1).finally(() => process.exit(1));
}, 180_000);
for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
  process.once(signal, () => finalize('harness_signal', code).finally(() => process.exit(code)));
}
try { await main(); }
catch (error) { fatal = String(error?.message || error).slice(0, 2000); writeEvent({ event: 'fatal', failure: fatal }); }
await finalize();
