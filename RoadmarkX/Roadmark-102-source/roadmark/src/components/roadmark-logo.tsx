import { useEffect, useRef } from "react";

const pitch = 4;
// The bolt, plotted on the globe's 15 by 15 dot grid.
const bolt = [
  "...............",
  "...............",
  ".........##....",
  "........##.....",
  ".......##......",
  "......##.......",
  ".....######....",
  "....######.....",
  "........##.....",
  ".......##......",
  "......##.......",
  ".....##........",
  ".....#.........",
  "...............",
  "...............",
];
const round = (value: number) => Math.round(value * 100) / 100;
// How far along the bolt a dot sits: down the top stroke, across the bar,
// then down the tail. Current travels in this order.
const along = (row: number, column: number) =>
  row < 6 ? row - 2 : row < 8 ? 4 + (column - 4) / 3 : 6.5 + (row - 8);
const charged = bolt.flatMap((line, row) =>
  Array.from(line, (mark, column) =>
    mark === "#"
      ? [
          {
            x: 4 + column * pitch,
            y: 4 + row * pitch,
            along: round(along(row, column)),
          },
        ]
      : [],
  ).flat(),
);

// The globe: rows of dots spaced evenly around a sphere, so they bunch and
// shrink towards the rim. Each row keeps enough dots to fill its visible half.
const globe = bolt.flatMap((_, row) => {
  const y = 4 + row * pitch;
  const reach = Math.sqrt(30 * 30 - (y - 32) * (y - 32));
  const step = (2 * Math.PI) / Math.round((2 * Math.PI * reach) / pitch);
  const count = Math.ceil(Math.PI / step);
  return Array.from({ length: count }, (_, index) => ({
    y,
    reach,
    offset: index * step,
    span: count * step,
  }));
});
const tilt = (-23 * Math.PI) / 180;
/** Where a globe dot sits once the sphere has turned by `turn` radians. */
function place(dot: (typeof globe)[number], turn: number) {
  const longitude =
    ((((dot.offset + turn) % dot.span) + dot.span) % dot.span) - Math.PI / 2;
  if (longitude >= Math.PI / 2) return { x: 32, y: 32, r: 0, opacity: 0 };
  // Lean the whole sphere over, so it spins about a tilted axis.
  const across = dot.reach * Math.sin(longitude);
  const down = dot.y - 32;
  const x = 32 + across * Math.cos(tilt) - down * Math.sin(tilt);
  const y = 32 + across * Math.sin(tilt) + down * Math.cos(tilt);
  const edge = Math.min(1, Math.hypot(across, down) / 30);
  // Dots dim as they pass behind the bolt, so the two never collide.
  let gap = Infinity;
  for (const spot of charged)
    gap = Math.min(gap, Math.hypot(spot.x - x, spot.y - y));
  return {
    x: round(x),
    y: round(y),
    r: round(1.05 * Math.sqrt(1 - edge * edge)),
    opacity: round(0.5 * Math.min(1, Math.max(0, (gap - 2.6) / 2.2))),
  };
}

// Five by seven dot-matrix capitals for the wordmark.
const glyphs: Record<string, string[]> = {
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
};
const letterColumn = (letter: number, column: number) =>
  letter * 6 - (letter > 8 ? 3 : 0) + column;
const lit = new Set(
  Array.from("ROADMARK EV").flatMap((letter, index) =>
    (glyphs[letter] ?? []).flatMap((line, row) =>
      Array.from(line, (mark, column) =>
        mark === "#" ? `${letterColumn(index, column)},${row}` : "",
      ).filter(Boolean),
    ),
  ),
);
const letters = Array.from(lit, (key) => key.split(",").map(Number));
// The 63-column wordmark spans exactly the globe's width, centred beneath it.
const wordPitch = 56 / 62;
const at = (column: number, row: number) =>
  `${round(4 + column * wordPitch)} ${round(62.6 + row * wordPitch)}`;
// Fine strokes join neighbouring dots so the letters stay legible when small.
const strokes = letters
  .flatMap(([column, row]) => {
    const has = (dx: number, dy: number) =>
      lit.has(`${column + dx},${row + dy}`);
    return [
      has(1, 0) && [1, 0],
      has(0, 1) && [0, 1],
      has(1, 1) && !has(1, 0) && !has(0, 1) && [1, 1],
      has(-1, 1) && !has(-1, 0) && !has(0, 1) && [-1, 1],
    ]
      .filter((step): step is number[] => !!step)
      .map(([dx, dy]) => `M${at(column, row)}L${at(column + dx, row + dy)}`);
  })
  .join("");

const green = [74, 115, 38];
const yellow = [240, 214, 72];
const between = (low: number, high: number) =>
  low + Math.random() * (high - low);

/** Roadmark EV logo: a halftone globe charged by a bolt, over its wordmark. */
export function RoadmarkLogo() {
  const charge = useRef<SVGGElement>(null);
  const sphere = useRef<SVGGElement>(null);
  // The globe turns slowly while faint surges of current run through the bolt
  // at irregular moments. Each surge starts somewhere different, stutters
  // along and never reaches full yellow.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = Array.from(
      charge.current?.querySelectorAll("circle") ?? [],
      (circle) => ({ circle, along: Number(circle.dataset.along), level: 0 }),
    );
    const land = Array.from(sphere.current?.querySelectorAll("circle") ?? []);
    let turn = 0;
    let surges: { at: number; end: number; speed: number; peak: number }[] = [];
    let wait = between(0.4, 1.6);
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const elapsed = Math.min((now - last) / 1000, 0.1);
      last = now;
      // The globe turns slowly: about two minutes for a full rotation.
      turn += elapsed * 0.05;
      land.forEach((circle, index) => {
        const spot = place(globe[index], turn);
        circle.setAttribute("cx", String(spot.x));
        circle.setAttribute("cy", String(spot.y));
        circle.setAttribute("r", String(spot.r));
        circle.setAttribute("opacity", String(spot.opacity));
      });
      wait -= elapsed;
      if (wait <= 0) {
        const from = Math.random() < 0.65 ? -1.5 : between(0, 6);
        surges.push({
          at: from,
          end: Math.min(12, from + between(4, 13)),
          speed: between(7, 16),
          peak: between(0.18, 0.5),
        });
        // Mostly long quiet gaps, now and then a quick second surge.
        wait = Math.random() < 0.25 ? between(0.12, 0.4) : between(1.2, 4.5);
      }
      for (const surge of surges)
        surge.at += surge.speed * elapsed * between(0.1, 1.9);
      surges = surges.filter((surge) => surge.at < surge.end + 3);
      for (const cell of cells) {
        let target = 0;
        for (const surge of surges) {
          const fade = Math.min(1, Math.max(0, (surge.end + 3 - surge.at) / 3));
          const distance = (cell.along - surge.at) / 1.6;
          target = Math.max(
            target,
            surge.peak * fade * Math.exp(-distance * distance),
          );
        }
        // Rise quickly, settle slowly, with a little grain per dot.
        target *= between(0.75, 1);
        const level =
          cell.level +
          (target - cell.level) * (target > cell.level ? 0.5 : 0.08);
        if (Math.abs(level - cell.level) < 0.002 && level < 0.004) continue;
        cell.level = level;
        cell.circle.style.fill = `rgb(${green
          .map((value, index) =>
            Math.round(value + (yellow[index] - value) * level),
          )
          .join(" ")})`;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <svg
      viewBox="0 0 64 69"
      width="128"
      height="138"
      role="img"
      aria-label="Roadmark EV"
      className="roadmark-logo"
    >
      <g ref={sphere}>
        {globe.map((dot, index) => {
          const spot = place(dot, 0);
          return (
            <circle
              key={index}
              cx={spot.x}
              cy={spot.y}
              r={spot.r}
              opacity={spot.opacity}
            />
          );
        })}
      </g>
      <g ref={charge}>
        {charged.map((dot) => (
          <circle
            key={`${dot.x}-${dot.y}`}
            data-along={dot.along}
            cx={dot.x}
            cy={dot.y}
            r="1.7"
          />
        ))}
      </g>
      <g className="roadmark-wordmark">
        <path d={strokes} />
        {letters.map(([column, row]) => (
          <circle
            key={`${column}-${row}`}
            cx={round(4 + column * wordPitch)}
            cy={round(62.6 + row * wordPitch)}
            r=".42"
          />
        ))}
      </g>
    </svg>
  );
}
