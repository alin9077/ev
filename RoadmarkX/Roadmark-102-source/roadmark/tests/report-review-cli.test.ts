import test from "node:test";
import assert from "node:assert/strict";
import { constants } from "node:fs";
import { chmod, lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { pathToFileURL } from "node:url";
import {
  decodePreviewUtf8, parsePreviewArguments, previewErrorCode, readPreviewFile,
  readPreviewStdin, runPreviewCli, type ReadOnlyHandle, type ReadOnlyIO,
} from "../scripts/preview-report-review";
import { MAX_PREVIEW_REQUEST_BYTES, ReportPreviewError, type PreviewErrorCode } from "../src/lib/report-review-dry-run";
import { MAX_STORED_REPORT_BYTES } from "../src/lib/report-claim-binding";
import { chunks, defaultRequest, fixture, uuid } from "./helpers/report-preview-fixture";
const rejects = async (promise: Promise<unknown>, code: PreviewErrorCode) => assert.rejects(promise,
  (error: unknown) => error instanceof ReportPreviewError && error.code === code);
const argv = ["--queue-dir", "/synthetic-private/queue", "--history", "/synthetic-private/history.json"];
const cap = 128;
function fakeFile(data: Uint8Array, options: {
  partial?: number; statSize?: number; regular?: boolean; changed?: "dev" | "ino" | "size" | "mtimeMs" | "ctimeMs"; readFails?: boolean; closeFails?: boolean;
} = {}) {
  let closed = 0, opened = 0, reads = 0, stats = 0;
  const paths: string[] = [], flags: number[] = [];
  const handle: ReadOnlyHandle = {
    stat: async () => {
      const value = { isFile: () => options.regular !== false, size: options.statSize ?? data.length, dev: 1, ino: 2, mtimeMs: 3, ctimeMs: 3 };
      if (++stats > 1 && options.changed) value[options.changed]++;
      return value;
    },
    read: async (buffer, offset, length, position) => {
      reads++; if (options.readFails) throw new Error("PRIVATE read error /secret/path");
      const part = data.subarray(position, position + Math.min(length, options.partial ?? length));
      buffer.set(part, offset); return { bytesRead: part.length };
    },
    close: async () => { closed++; if (options.closeFails) throw new Error("PRIVATE close error"); },
  };
  const io: ReadOnlyIO = { constants, open: async (filename, flag) => {
    opened++; paths.push(filename); flags.push(flag); return handle;
  } };
  return { io, count: () => ({ closed, opened, reads, stats }), paths, flags };
}
const data = (text: string) => new TextEncoder().encode(text);
async function tree(directory: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const visit = async (dir: string) => {
    for (const name of (await readdir(dir)).sort()) {
      const file = path.join(dir, name), relative = path.relative(directory, file), stat = await lstat(file);
      if (stat.isDirectory()) { result[relative] = "directory"; await visit(file); }
      else if (stat.isSymbolicLink()) result[relative] = "symlink:" + await readlink(file);
      else if (stat.isFile()) result[relative] = "file:" + (await readFile(file)).toString("base64");
      else result[relative] = "nonregular:" + stat.mode;
    }
  };
  await visit(directory); return result;
}
async function diskFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "roadmark-preview94-")), queue = path.join(root, "queue");
  await mkdir(queue);
  const f = await fixture(), history = path.join(root, "history.json"), report = path.join(queue, f.file);
  await writeFile(history, "[]", { mode: 0o600 }); await writeFile(report, JSON.stringify(f.raw), { mode: 0o600 });
  return { ...f, root, queue, history, report, args: ["--queue-dir", queue, "--history", history] };
}
test("strict flags require both explicit local paths and no duplicate/unknown/network options", () => {
  assert.deepEqual(parsePreviewArguments(argv), { queueDir: argv[1], history: argv[3] });
  assert.deepEqual(parsePreviewArguments(["--history", "history.json", "--queue-dir", "queue"]), { queueDir: "queue", history: "history.json" });
  for (const value of [[], argv.slice(0, 2), [...argv, "--write"], ["--queue-dir", "q", "--queue-dir", "q"],
    ["--queue-dir", "https://example.com/queue", "--history", "h"], ["--queue-dir", "q", "--history", ""],
    ["--out", "q", "--history", "h"], ["--queue-dir", "q\0", "--history", "h"]]) {
    assert.throws(() => parsePreviewArguments(value), (error) => error instanceof ReportPreviewError && error.code === "invalid_arguments");
  }
});
test("invalid arguments/requests/UTF8 and oversized stdin fail before any file open", async () => {
  const fake = fakeFile(data("[]"));
  await rejects(runPreviewCli([], chunks("{}"), fake.io), "invalid_arguments");
  await rejects(runPreviewCli(argv, chunks(JSON.stringify({ ...defaultRequest(), reportId: "../escape" })), fake.io), "invalid_request");
  await rejects(runPreviewCli(argv, chunks(new Uint8Array([0xc3, 0x28])), fake.io), "invalid_utf8");
  await rejects(runPreviewCli(argv, chunks(" ".repeat(MAX_PREVIEW_REQUEST_BYTES + 1)), fake.io), "request_too_large");
  assert.equal(fake.count().opened, 0);
});
test("bounded stdin supports split multi-byte sequences; UTF8/BOM failures do not silently normalize", async () => {
  assert.equal(await readPreviewStdin(chunks("人🧪", 1)), "人🧪");
  assert.throws(() => decodePreviewUtf8(new Uint8Array([0xef, 0xbb, 0xbf, 0x7b, 0x7d])), ReportPreviewError);
  assert.throws(() => decodePreviewUtf8(new Uint8Array([0xc3])), ReportPreviewError);
  await rejects(readPreviewStdin((async function* () { throw new Error("PRIVATE input failure"); })()), "input_failed");
});
test("bounded descriptor reader uses exact flags, partial reads, offset cap and always closes", async () => {
  const fake = fakeFile(data('{"synthetic":true}'), { partial: 2 });
  assert.deepEqual(await readPreviewFile("selected", cap, fake.io), { synthetic: true });
  assert.deepEqual(fake.flags, [constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK]);
  assert.ok(fake.count().reads > 1); assert.equal(fake.count().closed, 1);
});
test("unsupported protective flags fail before opening without a fallback", async () => {
  for (const overrides of [{ O_NOFOLLOW: undefined }, { O_NOFOLLOW: 0 }, { O_NONBLOCK: undefined }, { O_NONBLOCK: 0 }]) {
    const fake = fakeFile(data("[]")); fake.io.constants = { ...constants, ...overrides };
    await rejects(readPreviewFile("selected", cap, fake.io), "protection_unavailable");
    assert.equal(fake.count().opened, 0);
  }
});
test("nonregular, oversize, growth, shrink, metadata drift, invalid JSON and invalid UTF8 all close descriptors", async () => {
  const cases: [Uint8Array, Parameters<typeof fakeFile>[1], PreviewErrorCode][] = [
    [data("[]"), { regular: false }, "file_not_regular"],
    [data("[]"), { statSize: cap + 1 }, "file_too_large"],
    [data(" ".repeat(cap + 1)), { statSize: 2, partial: 3 }, "file_too_large"],
    [data("[]"), { statSize: 3 }, "file_changed"],
    ...["dev", "ino", "size", "mtimeMs", "ctimeMs"].map((changed) => [data("[]"), { changed: changed as "dev" | "ino" | "size" | "mtimeMs" | "ctimeMs" }, "file_changed"] as [Uint8Array, Parameters<typeof fakeFile>[1], PreviewErrorCode]),
    [data("{"), {}, "invalid_json"],
    [new Uint8Array([0xc3]), {}, "invalid_utf8"],
    [data("[]"), { readFails: true }, "file_unreadable"],
    [data("[]"), { closeFails: true }, "file_unreadable"],
  ];
  for (const [value, options, code] of cases) {
    const fake = fakeFile(value, options);
    await rejects(readPreviewFile("PRIVATE path", cap, fake.io), code);
    assert.equal(fake.count().closed, 1, code);
  }
});
test("read denial is sanitized and does not leak path or exception text", async () => {
  const io: ReadOnlyIO = { constants, open: async () => { throw new Error("EACCES: PRIVATE /home/private/reporter"); } };
  await rejects(readPreviewFile("PRIVATE path", cap, io), "file_unreadable");
  assert.equal(previewErrorCode(new Error("PRIVATE unexpected")), "preview_failed");
});
test("only the explicit bound filename and history are opened, never directory enumeration or fallback", async () => {
  const f = await fixture(), opened: string[] = [], closed: number[] = [];
  const io: ReadOnlyIO = { constants, open: async (name, flag) => {
    opened.push(name); const index = opened.length;
    const fake = fakeFile(data(index === 1 ? JSON.stringify(f.raw) : "[]"));
    const handle = await fake.io.open(name, flag), originalClose = handle.close;
    handle.close = async () => { closed.push(index); await originalClose(); }; return handle;
  } };
  const output = JSON.parse(await runPreviewCli(argv, chunks(JSON.stringify(f.request)), io));
  assert.deepEqual(opened, [path.join(argv[1], f.file), argv[3]]); assert.deepEqual(closed, [1, 2]);
  assert.equal(output.saved, false); assert.equal(output.preview.reportStatus, "pending");
});
test("bad history and binding failures happen after both readers have closed", async () => {
  const f = await fixture();
  for (const invalid of ["history", "binding"] as const) {
    const closed: number[] = []; let opened = 0;
    const raw = invalid === "binding" ? { ...f.raw, observedValue: 999 } : f.raw;
    const io: ReadOnlyIO = { constants, open: async (name, flag) => {
      const index = ++opened, fake = fakeFile(data(index === 1 ? JSON.stringify(raw) : invalid === "history" ? '{"not":"array"}' : "[]"));
      const handle = await fake.io.open(name, flag), close = handle.close;
      handle.close = async () => { closed.push(index); await close(); }; return handle;
    } };
    await rejects(runPreviewCli(argv, chunks(JSON.stringify(f.request)), io), invalid === "history" ? "invalid_history" : "report_unverified");
    assert.deepEqual(closed, [1, 2]);
  }
});
test("real fixture queue above 200 files still selects exact report and remains byte-identical across repeats", async () => {
  const f = await diskFixture();
  try {
    for (let i = 2; i <= 205; i++) await writeFile(path.join(f.queue, `bound-v2-${uuid(i)}.json`), "not selected", { mode: 0o600 });
    const before = await tree(f.root), request = JSON.stringify(f.request);
    const first = JSON.parse(await runPreviewCli(f.args, chunks(request))), second = JSON.parse(await runPreviewCli(f.args, chunks(request)));
    assert.equal(first.proposal.report.id, f.raw.id); assert.notEqual(first.proposal.id, second.proposal.id);
    assert.equal(first.saved, false); assert.equal(second.saved, false); assert.deepEqual(await tree(f.root), before);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test("real missing, directory, symlink, malformed and oversized inputs remain unchanged; no directory creation", async () => {
  const f = await diskFixture();
  try {
    const target = path.join(f.root, "target.json"); await writeFile(target, "[]", { mode: 0o600 });
    const link = path.join(f.root, "link.json"); await symlink(target, link);
    const malformed = path.join(f.root, "malformed.json"); await writeFile(malformed, "{");
    const invalid = path.join(f.root, "utf8.json"); await writeFile(invalid, new Uint8Array([0xc3]));
    const big = path.join(f.root, "big.json"); await writeFile(big, " ".repeat(MAX_STORED_REPORT_BYTES + 1));
    const before = await tree(f.root);
    for (const [file, code] of [[path.join(f.root, "absent", "file"), "file_unreadable"], [f.queue, "file_not_regular"],
      [link, "file_unreadable"], [malformed, "invalid_json"], [invalid, "invalid_utf8"], [big, "file_too_large"]] as const) {
      await rejects(readPreviewFile(file, MAX_STORED_REPORT_BYTES), code); assert.deepEqual(await tree(f.root), before);
    }
    for (const input of [link, malformed, invalid, f.queue, path.join(f.root, "missing-history")]) {
      await assert.rejects(runPreviewCli(["--queue-dir", f.queue, "--history", input], chunks(JSON.stringify(f.request))), ReportPreviewError);
      assert.deepEqual(await tree(f.root), before);
    }
    await rm(f.report); await symlink(target, f.report);
    const linkedBefore = await tree(f.root);
    await rejects(runPreviewCli(f.args, chunks(JSON.stringify(f.request))), "file_unreadable");
    assert.deepEqual(await tree(f.root), linkedBefore);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test("real denied read fails safely when effective permissions permit the fixture", async (t) => {
  if (process.getuid?.() === 0) return t.skip("Root bypasses owner mode bits; injected denial is covered separately");
  const f = await diskFixture();
  try {
    await chmod(f.history, 0);
    await rejects(runPreviewCli(f.args, chunks(JSON.stringify(f.request))), "file_unreadable");
  } finally { await chmod(f.history, 0o600); await rm(f.root, { recursive: true, force: true }); }
});
test("actual CLI success is one JSON envelope; parse failures emit only a safe code and empty stdout", async () => {
  const f = await diskFixture();
  try {
    const cli = path.resolve("scripts/preview-report-review.ts"), before = await tree(f.root);
    const run = (input: string) => spawnSync(process.execPath, ["--import", "tsx", cli, ...f.args], { input, encoding: "utf8", timeout: 10000 });
    const good = run(JSON.stringify(f.request));
    assert.equal(good.error, undefined); assert.equal(good.status, 0, good.stderr); assert.equal(good.stderr, "");
    assert.equal(JSON.parse(good.stdout).saved, false); assert.equal(good.stdout.trim().split("\n").length, 1);
    const bad = run('{"PRIVATE unknown":"SECRET reporter"}');
    assert.equal(bad.status, 1); assert.equal(bad.stdout, ""); assert.equal(bad.stderr, "invalid_request\n");
    assert.deepEqual(await tree(f.root), before);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test("broken stdout pipe fails with one safe code and no stack or input mutation", async () => {
  const f = await diskFixture();
  try {
    const before = await tree(f.root);
    const child = spawn(process.execPath, ["--import", "tsx", path.resolve("scripts/preview-report-review.ts"), ...f.args], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const timeout = setTimeout(() => child.kill("SIGKILL"), 10000);
    let stderr = "";
    child.stderr.setEncoding("utf8"); child.stderr.on("data", (chunk) => { stderr += chunk; });
    // Close the read end before the child starts writing; no leaked partial output is collected.
    child.stdout.destroy(); child.stdin.end(JSON.stringify(f.request));
    try {
      const [code, signal] = await once(child, "close");
      assert.equal(signal, null); assert.equal(code, 1); assert.equal(stderr, "output_failed\n");
    } finally { clearTimeout(timeout); }
    assert.deepEqual(await tree(f.root), before);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test("actual final FIFO is rejected promptly with no writer and no fixture changes", async (t) => {
  if (process.platform !== "linux") return t.skip("Linux no-follow/nonblock fixture is required for this acceptance environment");
  const f = await diskFixture();
  try {
    await rm(f.history);
    const setup = spawnSync("mkfifo", ["-m", "600", f.history], { encoding: "utf8", timeout: 5000 });
    assert.equal(setup.status, 0, setup.stderr);
    const before = await tree(f.root);
    const result = spawnSync(process.execPath, ["--import", "tsx", path.resolve("scripts/preview-report-review.ts"), ...f.args], {
      input: JSON.stringify(f.request), encoding: "utf8", timeout: 10000,
    });
    assert.equal(result.error, undefined); assert.equal(result.status, 1); assert.equal(result.stdout, "");
    assert.equal(result.stderr, "file_not_regular\n"); assert.deepEqual(await tree(f.root), before);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
test("importing the CLI with no command invocation does not read reports, create data, print or start a server", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "roadmark-preview94-import-"));
  try {
    const cli = pathToFileURL(path.resolve("scripts/preview-report-review.ts")).href;
    const loader = pathToFileURL(path.resolve("node_modules/tsx/dist/loader.mjs")).href;
    const source = `import { syncBuiltinESMExports } from 'node:module';
      import fs from 'node:fs/promises'; import http from 'node:http'; import https from 'node:https';
      for (const key of ['open','writeFile','mkdir','rename','unlink','link','chmod']) fs[key] = () => { throw new Error('Unexpected data IO: ' + key); };
      http.createServer = https.createServer = () => { throw new Error('Unexpected server'); };
      syncBuiltinESMExports(); await import(${JSON.stringify(cli)});`;
    const before = await tree(root);
    const result = spawnSync(process.execPath, ["--import", loader, "--input-type=module", "-e", source], {
      cwd: root, encoding: "utf8", timeout: 10000, env: { ...process.env, TSX_DISABLE_CACHE: "1", NEXT_PUBLIC_SITE_URL: "https://example.invalid" },
    });
    assert.equal(result.error, undefined); assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, ""); assert.equal(result.stderr, ""); assert.deepEqual(await tree(root), before);
  } finally { await rm(root, { recursive: true, force: true }); }
});
test("new runtime source has no application wiring, write primitives, network clients or catalogue/register dependency", async () => {
  const pure = await readFile("src/lib/report-review-dry-run.ts", "utf8"), cli = await readFile("scripts/preview-report-review.ts", "utf8");
  assert.ok(!/from ["'](?:node:|.*(?:\/data|local-report-store|serve-roadmark|approved-))/.test(pure));
  assert.ok(!/process\.(?:env|cwd)|fetch\(|readFile\(|readdir\(|mkdir\(|rename\(|unlink\(|chmod\(|writeFile\(/.test(pure + cli));
  assert.ok(!/node:(?:http|https|net|child_process)/.test(pure + cli));
});
