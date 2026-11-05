import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  CHANGE_TYPES,
  OUTCOMES,
  REFRESH_PACKAGE_SCRIPTS,
} from "../scripts/refresh/findings-schema";

const runbook = fs.readFileSync("docs/REFRESH_RUNBOOK.md", "utf8");
const scripts = JSON.parse(fs.readFileSync("package.json", "utf8")).scripts as
  Record<string, string>;

test("every pnpm command the runbook tells a worker to run exists", () => {
  const commands = [...runbook.matchAll(/^pnpm ([a-z:]+)/gm)].map((m) => m[1]);
  assert.ok(commands.length >= 8, "runbook should contain its commands");
  for (const name of commands)
    assert.ok(
      name in scripts || ["install"].includes(name),
      `runbook runs "pnpm ${name}" but package.json has no such script`,
    );
  for (const name of REFRESH_PACKAGE_SCRIPTS)
    assert.ok(runbook.includes(`pnpm ${name}`), `runbook omits ${name}`);
});

test("the runbook documents exactly the outcomes the tooling accepts", () => {
  for (const outcome of OUTCOMES)
    assert.ok(
      runbook.includes(`\`${outcome}\``),
      `outcome ${outcome} is not explained in the runbook`,
    );
});

test("the runbook lists every change type the diff can emit, and no other", () => {
  const listed = /A change is exactly one of: ([^.]+)\./.exec(runbook)?.[1];
  assert.ok(listed);
  const names = [...listed.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
  assert.deepEqual(names, [...CHANGE_TYPES]);
});

test("the runbook states the cadence without creating any automation", () => {
  assert.match(runbook, /first five working days/);
  assert.match(runbook, /top 14 brands/);
  assert.match(runbook, /Nothing is scheduled/);
  assert.match(runbook, /No value from memory, news or dealer pages/);
  assert.match(runbook, /source unavailable, value retained, date unchanged/);
});
