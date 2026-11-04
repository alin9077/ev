import { test } from "node:test";
import assert from "node:assert/strict";
import { chapterArt } from "../src/lib/chapter-art";
import { chapterScenes, chapterScenesB } from "../src/lib/chapter-scenes";
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
    carplay_android_auto: { status: "unavailable", value: "Not offered" },
  },
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
    // Slower than the A scenes, except the drive, which is one ten-second run.
    assert.ok(scene.loop >= (n === "02" ? 10 : 15) && scene.loop <= 20, n);
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
