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
const dots = bolt
  .flatMap((line, row) =>
    Array.from(line, (mark, column) => {
      const x = 4 + column * pitch;
      const y = 4 + row * pitch;
      const edge = Math.hypot(x - 32, y - 32) / 30;
      if (mark === "#") return { x, y, r: 1.7, charged: true };
      // The globe's dots shrink towards its rim, like a halftone sphere.
      return {
        x,
        y,
        r: round(1.05 * Math.sqrt(1 - edge * edge)),
        charged: false,
      };
    }),
  )
  .filter((dot) => dot.r > 0.25);

// Five by seven dot-matrix capitals, one string per row.
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
const columnOf = (index: number, column: number) =>
  index * 6 - (index > 8 ? 3 : 0) + column;
const lit = new Set(
  Array.from("ROADMARK EV").flatMap((letter, index) =>
    (glyphs[letter] ?? []).flatMap((line, row) =>
      Array.from(line, (mark, column) =>
        mark === "#" ? `${columnOf(index, column)},${row}` : "",
      ).filter(Boolean),
    ),
  ),
);
const letters = Array.from(lit, (key) => key.split(",").map(Number));
const at = (column: number, row: number) => `${2 + column * 2} ${73 + row * 2}`;
// Fine strokes join neighbouring dots so the letters hold together when small.
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
      .filter((step): step is number[] => Boolean(step))
      .map(([dx, dy]) => `M${at(column, row)}L${at(column + dx, row + dy)}`);
  })
  .join("");

/** Concentric arcs that twist as they widen, like a woodblock wave curl. */
function swirl(cx: number, cy: number, turn: 1 | -1, base: number) {
  return Array.from({ length: 8 }, (_, index) => {
    const r = 3 + index * 3;
    const start = ((base + turn * r * 9) * Math.PI) / 180;
    const end = start + (turn * 220 * Math.PI) / 180;
    return `M${round(cx + r * Math.cos(start))} ${round(cy + r * Math.sin(start))}A${r} ${r} 0 1 ${turn === 1 ? 1 : 0} ${round(cx + r * Math.cos(end))} ${round(cy + r * Math.sin(end))}`;
  }).join("");
}

/** Roadmark EV logo: a halftone globe charged by a bolt, over its wordmark. */
export function RoadmarkLogo() {
  return (
    <svg
      viewBox="0 0 126 88"
      width="126"
      height="88"
      role="img"
      aria-label="Roadmark EV"
      className="roadmark-logo"
    >
      <clipPath id="roadmark-globe">
        <circle cx="32" cy="32" r="29.5" />
      </clipPath>
      <g transform="translate(31)">
        <g className="roadmark-waves" clipPath="url(#roadmark-globe)">
          <path
            d={swirl(23, 25, 1, -60)}
            style={{ transformOrigin: "23px 25px" }}
          />
          <path
            d={swirl(43, 43, -1, 120)}
            style={{ transformOrigin: "43px 43px" }}
          />
        </g>
        {[false, true].flatMap((charged) =>
          dots
            .filter((dot) => dot.charged === charged)
            .map((dot) => (
              <circle
                key={`${dot.x}-${dot.y}`}
                className={charged ? "roadmark-bolt" : "roadmark-dot"}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
              />
            )),
        )}
      </g>
      <g className="roadmark-wordmark">
        <path d={strokes} />
        {letters.map(([column, row]) => (
          <circle
            key={`${column}-${row}`}
            cx={2 + column * 2}
            cy={73 + row * 2}
            r=".95"
          />
        ))}
      </g>
    </svg>
  );
}
