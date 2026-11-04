import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterArt } from "../src/lib/chapter-art";
import { chapterScenes, chapterScenesB } from "../src/lib/chapter-scenes";
import { DRIVE_LOOP, drivePose } from "../src/lib/scenes/b/drive";
import { chapters } from "../src/lib/chapters";

/** A stand-in canvas context that records every call and every property set. */
function recorder() {
  const log: string[] = [];
  const note = (name: string, values: unknown[]) => {
    for (const value of values.flat())
      if (typeof value === "number")
        assert.ok(Number.isFinite(value), `${name} was given ${value}`);
    log.push(`${name} ${JSON.stringify(values)}`);
  };
  const gradient = {
    addColorStop: (...args: unknown[]) => note("addColorStop", args),
  };
  const ctx = new Proxy(
    {},
    {
      get:
        (_, name: string) =>
        (...args: unknown[]) => {
          note(name, args);
          if (name === "measureText") return { width: 60 };
          return name.endsWith("Gradient") ? gradient : undefined;
        },
      set: (_, name: string, value) => {
        note(name, [value === gradient ? "gradient" : value]);
        return true;
      },
    },
  ) as CanvasRenderingContext2D;
  return { ctx, log };
}
function frame(chapter: string, time: number, width = 1480, height = 832) {
  const { ctx, log } = recorder();
  const shown = chapterScenes[chapter].draw(ctx, width, height, time, 2);
  return { log, shown };
}

test("every chapter opens on a three-beat scene with a resting frame", () => {
  assert.deepEqual(
    Object.keys(chapterScenes).sort(),
    chapters.map((c) => c.n).sort(),
  );
  for (const [n, scene] of Object.entries(chapterScenes)) {
    assert.equal(scene.beats.length, 3, n);
    assert.equal(new Set(scene.beats).size, 3, n);
    assert.ok(scene.loop >= 9 && scene.loop <= 12, n);
    assert.ok(scene.still >= 0 && scene.still < scene.loop, n);
    assert.ok(chapterArt[n].scene && chapterArt[n].sceneAlt, n);
    // The resting frame is the tone the panel is first shown in.
    assert.equal(frame(n, scene.still).shown.tone, scene.tone, n);
  }
});

test("the set mixes day and night", () => {
  const tones = Object.values(chapterScenes).map((scene) => scene.tone);
  assert.ok(tones.filter((tone) => tone === "day").length >= 3);
  assert.ok(tones.filter((tone) => tone === "night").length >= 2);
  // Software passes from one to the other inside its loop.
  const software = chapterScenes["07"];
  const seen = new Set<string>();
  for (let step = 0; step < 24; step++)
    seen.add(frame("07", (step / 24) * software.loop).shown.tone);
  assert.deepEqual([...seen].sort(), ["day", "night"]);
});

test("scenes draw finite geometry through the whole loop, wide and square", () => {
  for (const [n, scene] of Object.entries(chapterScenes))
    for (let step = 0; step <= 36; step++) {
      const time = (step / 36) * scene.loop;
      assert.ok(frame(n, time).log.length > 100, n);
      assert.ok(frame(n, time, 716, 716).log.length > 100, n);
    }
});

test("every beat is reached, in order, with progress from 0 to 1", () => {
  for (const [n, scene] of Object.entries(chapterScenes)) {
    const order: number[] = [];
    for (let step = 0; step < 120; step++) {
      const { shown } = frame(n, (step / 120) * scene.loop);
      assert.ok(shown.progress >= 0 && shown.progress <= 1, n);
      // The driving scene rests between its acts.
      if (shown.beat >= 0 && order[order.length - 1] !== shown.beat)
        order.push(shown.beat);
    }
    assert.deepEqual(order, [0, 1, 2], n);
  }
});

test("scenes repeat exactly every loop", () => {
  // Loops and these moments are whole eighths of a second, so they survive
  // the wrap without rounding and frames match exactly.
  for (const [n, scene] of Object.entries(chapterScenes)) {
    assert.equal((scene.loop * 8) % 1, 0, n);
    for (const time of [0, 0.375, 1, 2.75, 5.25, 8.875])
      for (const laps of [1, 7])
        assert.deepEqual(
          frame(n, time + laps * scene.loop).log,
          frame(n, time).log,
          `${n} at ${time}s`,
        );
  }
});

/**
 * A lighter stand-in for the B scenes, which paint far more per frame: it
 * checks every number as it goes, counts the calls and keeps only the text.
 */
function counter() {
  const seen = { calls: 0, text: [] as string[] };
  const check = (name: string, values: unknown[]) => {
    seen.calls += 1;
    for (const value of values.flat())
      if (typeof value === "number")
        assert.ok(Number.isFinite(value), `${name} was given ${value}`);
  };
  const gradient = {
    addColorStop: (...args: unknown[]) => check("addColorStop", args),
  };
  const ctx = new Proxy(
    {},
    {
      get:
        (_, name: string) =>
        (...args: unknown[]) => {
          check(name, args);
          if (name === "fillText") seen.text.push(String(args[0]));
          if (name === "measureText") return { width: 60 };
          return name.endsWith("Gradient") ? gradient : undefined;
        },
      set: (_, name: string, value) => {
        check(name, [value]);
        return true;
      },
    },
  ) as CanvasRenderingContext2D;
  return { ctx, seen };
}
const carB = (name: string, price: number, seconds: number) => ({
  name,
  facts: {
    price_aud: price,
    warranty: "5 years / unlimited km",
    battery_warranty: "8 years / 160,000 km",
    range_km: 466,
    dc_peak_kw: 175,
    dc_charge_time_min: 24,
    seats: 5,
    boot_l: 822,
    frunk_l: 116,
    zero_to_100_s: seconds,
  },
  features: {
    driveaway_price: { status: "standard", value: "A$63,963 in Sydney" },
    safety_ancap: { status: "standard", value: "5 stars (2025) · adult 91%" },
    adas_standard: {
      status: "standard",
      value: "Adaptive cruise · lane centring · AEB",
    },
    phone_key: { status: "standard", value: "Bluetooth phone key" },
    passive_unlock: { status: "standard", value: "Phone in pocket" },
    walk_away_lock: { status: "unavailable", value: "Not offered" },
    front_heated_seats: { status: "standard", value: "Included" },
    front_ventilated_seats: { status: "unavailable", value: "Not fitted" },
    ota_capability_scope: {
      status: "standard",
      value: "Whole car — all of it",
    },
    app_connectivity: { status: "standard", value: "App — key and climate" },
    adas_optional: { status: "optional", value: "Supervised · A$149/month" },
    parking_cameras: { status: "standard", value: "Cameras all round" },
    home_charging: { status: "standard", value: "About 8.5 hours" },
    supercharger_access: { status: "standard", value: "Whole network" },
    navigation_route_planner: { status: "standard", value: "Plans stops" },
    storage: { status: "standard", value: "822 L boot · 116 L front" },
    power_tailgate: { status: "standard", value: "Powered tailgate" },
    driver_profiles_local: { status: "standard", value: "Up to 10 profiles" },
    remote_preconditioning: { status: "standard", value: "From the app" },
  },
  releases: [
    { date: "2025-03-25", change: "Preconditioning on the way to chargers." },
    { date: "2025-05-08", change: "Alternative trip plans." },
    { date: "2026-05-01", change: "Comfort Braking." },
    { date: "2026-09-16", change: "Navigation refinements." },
  ],
  releaseMinimum: 4,
  releaseWindow: ["2024-10-05", "2026-10-05"] as [string, string],
});
const specB = {
  rangeKm: 466,
  rivalRangeKm: 482,
  cars: [carB("Model Y", 58900, 5.9), carB("Sealion 7", 54990, 6.7)] as [
    ReturnType<typeof carB>,
    ReturnType<typeof carB>,
  ],
};

test("the B site has a day scene for every chapter", () => {
  assert.deepEqual(
    Object.keys(chapterScenesB).sort(),
    chapters.map((c) => c.n).sort(),
  );
  for (const [n, { scene, alt }] of Object.entries(chapterScenesB)) {
    assert.equal(scene.beats.length, 3, n);
    assert.equal(new Set(scene.beats).size, 3, n);
    assert.equal(scene.tone, "day", n);
    assert.ok(alt.length > 120, n);
    // Slower than the A scenes, except the drive, which is one short run.
    assert.ok(scene.loop >= (n === "02" ? 10 : 15) && scene.loop <= 22, n);
    assert.ok(scene.still >= 0 && scene.still < scene.loop, n);
  }
});

test("B scenes draw finite geometry all through the loop, without WebGL", () => {
  // Node has no WebGL, so this is the 2D stand-in: the same scene, the same
  // camera and the same labels, painted flat.
  for (const [n, { scene }] of Object.entries(chapterScenesB))
    for (let time = 0; time < scene.loop; time += 0.5) {
      const wide = counter();
      scene.draw(wide.ctx, 2400, 1028, time, 2, specB);
      assert.ok(wide.seen.calls > 200, `${n} at ${time}`);
      if (time % 2) continue;
      // A phone's square plate, and the page before it has a selection.
      scene.draw(counter().ctx, 700, 700, time, 2, specB);
      scene.draw(counter().ctx, 2400, 1028, time, 2);
    }
});

test("B scenes quote the selected cars on their resting frame", () => {
  for (const [n, { scene }] of Object.entries(chapterScenesB)) {
    const { ctx, seen } = counter();
    scene.draw(ctx, 2400, 1028, scene.still, 2, specB);
    assert.ok(seen.text.includes("Model Y"), `${n} names the baseline`);
    assert.ok(seen.text.length >= 4, `${n} gives a figure for each car`);
  }
});

test("B scenes reach every beat in order, and clear where the loop joins", () => {
  for (const [n, { scene }] of Object.entries(chapterScenesB)) {
    const order: number[] = [];
    for (let step = 0; step < 80; step++) {
      const shown = scene.draw(
        counter().ctx,
        1200,
        514,
        (step / 80) * scene.loop,
        1,
        specB,
      );
      assert.ok(shown.progress >= 0 && shown.progress <= 1, n);
      assert.equal(shown.tone, "day", n);
      if (order[order.length - 1] !== shown.beat) order.push(shown.beat);
    }
    assert.deepEqual(order, [0, 1, 2], n);
    // No labels at the join: the plate has cleared to the floor. The drive
    // is one unbroken lap and never clears.
    if (n === "02") continue;
    for (const time of [0, scene.loop - 0.01]) {
      const { ctx, seen } = counter();
      scene.draw(ctx, 1200, 514, time, 1, specB);
      assert.deepEqual(seen.text, [], `${n} at ${time}`);
    }
  }
});

test("the B drive keeps its supervision note up all through the lap", () => {
  const { scene } = chapterScenesB["02"];
  for (let time = 0; time < scene.loop; time += 0.5) {
    const { ctx, seen } = counter();
    scene.draw(ctx, 1200, 514, time, 1, specB);
    assert.ok(
      seen.text.some((text) => /driver supervises/i.test(text)),
      `at ${time}`,
    );
  }
});

test("B scenes state the conditions the brief asks for", () => {
  const said = (n: string, time: number) => {
    const { ctx, seen } = counter();
    chapterScenesB[n].scene.draw(ctx, 2400, 1028, time, 2, specB);
    return seen.text.join(" | ");
  };
  assert.match(said("01", 3.9), /before on-road costs/);
  assert.match(said("01", 10.8), /example 50c/);
  assert.match(said("03", 10.6), /extensive, integrated fast-charging network/);
  assert.match(said("07", 4.9), /minimums/);
  assert.doesNotMatch(said("07", 4.9), /CarPlay|Android Auto/);
});

test("B scenes show each figure's basis and say when two prices are not comparable", () => {
  const withBases = (price: string, window: string) => ({
    ...carB("Model Y", 58900, 5.9),
    bases: { price_aud: price, dc_charge_time_min: window },
  });
  const mixed = {
    ...specB,
    incomparable: ["price_aud", "dc_charge_time_min"],
    cars: [
      withBases("List", "10–80%"),
      { ...withBases("Driveaway", "30–80%"), name: "Inster" },
    ] as unknown as typeof specB.cars,
  };
  const said = (n: string, time: number) => {
    const { ctx, seen } = counter();
    chapterScenesB[n].scene.draw(ctx, 2400, 1028, time, 2, mixed);
    return seen.text.join(" | ");
  };
  const price = said("01", 3.9);
  assert.match(price, /A\$58,900 · List/);
  assert.match(price, /A\$58,900 · Driveaway/);
  assert.match(price, /not directly comparable/);
  const charge = said("03", 16.5);
  assert.match(charge, /10–80% in 24 min/);
  assert.match(charge, /30–80% in 24 min/);
});

test("the B drive is driven calmly: no sharp turns, hard braking or jumps", () => {
  const dt = 1 / 60;
  let before = drivePose(0),
    was = 0;
  for (let frame = 1; frame <= DRIVE_LOOP * 60; frame++) {
    const now = drivePose(frame * dt);
    let turned = now.heading - before.heading;
    while (turned > Math.PI) turned -= 2 * Math.PI;
    while (turned < -Math.PI) turned += 2 * Math.PI;
    const speed = Math.hypot(now.x - before.x, now.y - before.y) / dt;
    const yaw = Math.abs(turned / dt);
    const at = `at ${(frame * dt).toFixed(2)}s`;
    assert.ok(speed < 10, `speed ${at}`);
    // Under 45 degrees a second, and under a third of a g sideways.
    assert.ok(yaw < (45 * Math.PI) / 180, `turning ${at}`);
    assert.ok(speed * yaw < 3.5, `cornering ${at}`);
    assert.ok(Math.abs(speed - was) / dt < 4.5, `gaining or braking ${at}`);
    before = now;
    was = speed;
  }
  // It ends as it began, one block on, so the run has no join.
  const [first, last] = [drivePose(0), drivePose(DRIVE_LOOP)];
  assert.ok(Math.abs(last.y - first.y) < 0.01);
  assert.ok(Math.abs(Math.sin(last.heading - first.heading)) < 0.01);
});
