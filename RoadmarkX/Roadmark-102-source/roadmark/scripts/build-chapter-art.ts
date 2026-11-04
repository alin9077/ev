/**
 * Original chapter artwork, authored as code so the set stays on one grid.
 * Writes editable SVG to public/media/chapters. Conceptual editorial
 * illustration only: no manufacturer interface, figure or rating is depicted.
 */
import fs from "node:fs";
import path from "node:path";
import {
  PAPER,
  INK,
  SKY,
  DEEP,
  GREY,
  GREEN,
  YELLOW,
  ORANGE,
  LAVENDER,
  TEAL,
  ruler,
} from "./chapter-art-kit";
import { automatedDriving } from "./chapter-art-driving";

/** Every composition is drawn in a 960 × 900 box, then placed per format. */
const BOX = { w: 960, h: 900 };
const DESKTOP = { w: 1600, h: 900 },
  MOBILE = { w: 960, h: 1200 };

type Art = {
  file: string;
  background: string;
  /** Box offset on the desktop canvas; the remainder is heading space. */
  desktopX: number;
  /** Overrides the default box placement, for a scene that fills its canvas. */
  place?: Record<Format, { x: number; y: number; scale: number }>;
  /** Markup, plus keyframes when the artwork moves. */
  draw: (
    format: Format,
    frame: Frame,
  ) => string | { body: string; style: string };
};
type Format = "desktop" | "mobile";
/** The canvas edges, measured in the composition's own units. */
type Frame = { left: number; top: number; right: number; bottom: number };

/** Side profile on a 400-unit base; `y` is the roof line, wheels sit at y + 124·s. */
function carSide(x: number, y: number, w: number, glass: string, bg: string) {
  const wheel = (cx: number) =>
    `<circle cx="${cx}" cy="92" r="40" fill="${bg}"/><circle cx="${cx}" cy="92" r="32" fill="${INK}"/><circle cx="${cx}" cy="92" r="11" fill="${bg}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${w / 400})">
    <path d="M0 92V64q0-13 14-15l80-9 56-34q7-4 15-4h96q9 0 17 5l54 35 54 9q14 3 14 18v25Z" fill="${INK}"/>
    <path d="M116 40l44-27h34v27ZM206 13h54l42 27h-96Z" fill="${glass}"/>
    ${wheel(88)}${wheel(312)}
  </g>`;
}

const node = (x: number, y: number, r = 8) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`;

function priceOwnership() {
  let days = "";
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 4; i++)
      days += `<circle cx="${706 + i * 46}" cy="${248 + j * 44}" r="10" fill="${i === 2 && j === 1 ? INK : GREY}"/>`;
  return `
  <circle id="field" cx="400" cy="470" r="290" fill="${GREY}"/>
  <g id="connections" fill="none" stroke="${INK}" stroke-width="3">
    <path d="M320 265H665M215 325V552M775 380V444"/>
  </g>
  ${node(492, 265)}${node(215, 440)}${node(775, 412)}
  <g id="price-marker">
    <path d="M110 205H260L320 265 260 325H110Z" fill="${SKY}"/>
    <circle cx="270" cy="265" r="13" fill="${PAPER}"/>
    <path d="M134 247H222M134 283H196" stroke="${INK}" stroke-width="10"/>
  </g>
  <g id="calendar">
    <rect x="668" y="153" width="214" height="224" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <rect x="665" y="150" width="220" height="56" fill="${INK}"/>
    <path d="M720 128V172M830 128V172" stroke="${PAPER}" stroke-width="18"/>
    <path d="M720 128V172M830 128V172" stroke="${INK}" stroke-width="8"/>
    ${days}
  </g>
  <g id="vehicle">${carSide(150, 505, 500, SKY, GREY)}</g>
  <g id="warranty" transform="translate(700 470)">
    <path d="M0 0 75-28 150 0V86C150 150 75 186 75 186S0 150 0 86Z" fill="${SKY}"/>
    <path d="M40 76 66 102 112 48" fill="none" stroke="${INK}" stroke-width="13"/>
  </g>
  <path id="ground" d="M60 660H900" stroke="${INK}" stroke-width="4"/>
  ${ruler()}`;
}

function rangeCharging() {
  let cells = "";
  for (let i = 0; i < 4; i++)
    cells +=
      i < 3
        ? `<rect x="${638 + i * 54}" y="738" width="42" height="74" fill="${GREEN}"/>`
        : `<rect x="${639.5 + i * 54}" y="739.5" width="39" height="71" fill="none" stroke="${INK}" stroke-width="3"/>`;
  return `
  <circle id="field" cx="480" cy="470" r="240" fill="${GREEN}"/>
  <g id="home">
    <path d="M90 740V650L150 595 210 650V740Z" fill="${INK}"/>
    <rect x="137" y="686" width="26" height="54" fill="${PAPER}"/>
  </g>
  <g id="route">
    <path d="M150 597V530L210 470H480L680 270H790" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="miter"/>
    <circle cx="820" cy="270" r="28" fill="${PAPER}" stroke="${INK}" stroke-width="12"/>
    <circle cx="820" cy="270" r="8" fill="${INK}"/>
  </g>
  <g id="charging-stop">
    <path d="M480 470V520" stroke="${INK}" stroke-width="6"/>
    <circle cx="480" cy="470" r="20" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    <rect x="440" y="520" width="80" height="170" rx="10" fill="${INK}"/>
    <rect x="424" y="690" width="112" height="14" fill="${INK}"/>
    <rect x="454" y="536" width="52" height="44" fill="${GREEN}"/>
    <path d="M487 598 465 636H479L473 668 496 626H482Z" fill="${PAPER}"/>
    <path d="M520 556h30a26 26 0 0 1 26 26v62" fill="none" stroke="${INK}" stroke-width="6"/>
    <rect x="560" y="642" width="32" height="40" rx="6" fill="${INK}"/>
    <path d="M569 682v16M583 682v16" stroke="${INK}" stroke-width="6"/>
  </g>
  <g id="battery">
    <rect x="620" y="720" width="240" height="110" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    <rect x="864" y="752" width="14" height="46" fill="${INK}"/>
    ${cells}
  </g>
  ${ruler()}`;
}

function spaceSafety() {
  const seat = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${INK}"/><rect x="${x - 16}" y="${y + h * 0.2}" width="10" height="${h * 0.6}" rx="5" fill="${INK}"/>`;
  return `
  <rect id="protective-outline" x="40" y="200" width="880" height="500" rx="180" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="18 12"/>
  <rect id="field" x="70" y="230" width="820" height="440" rx="150" fill="${YELLOW}"/>
  <path id="length" d="M130 150H830M130 138v24M830 138v24" fill="none" stroke="${INK}" stroke-width="3"/>
  <g id="vehicle-plan">
    <path d="M230 284h90M640 284h90M230 616h90M640 616h90" stroke="${INK}" stroke-width="16"/>
    <rect x="130" y="290" width="700" height="320" rx="100" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    <rect x="352" y="310" width="326" height="280" rx="48" fill="none" stroke="${INK}" stroke-width="3"/>
  </g>
  <g id="seating">
    ${seat(548, 326, 84, 100)}${seat(548, 474, 84, 100)}
    ${seat(392, 322, 76, 80)}${seat(392, 410, 76, 80)}${seat(392, 498, 76, 80)}
    <circle cx="655" cy="524" r="18" fill="none" stroke="${INK}" stroke-width="7"/>
  </g>
  <g id="cargo">
    <rect x="168" y="352" width="72" height="120" rx="8" fill="${INK}"/>
    <rect x="250" y="336" width="78" height="72" rx="8" fill="${SKY}"/>
    <rect x="250" y="418" width="78" height="54" rx="8" fill="${DEEP}"/>
    <rect x="171" y="485" width="86" height="76" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <rect x="270" y="482" width="58" height="92" rx="8" fill="${INK}"/>
    <path d="M190 372h28M285 500h28" stroke="${PAPER}" stroke-width="4"/>
    <rect x="712" y="398" width="66" height="104" rx="8" fill="${SKY}"/>
  </g>
  <g id="luggage-to-load">
    <path d="M214 752V716M200 730l14-14 14 14" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="168" y="773" width="88" height="74" rx="8" fill="${YELLOW}" stroke="${INK}" stroke-width="6"/>
    <rect x="272" y="790" width="60" height="60" rx="8" fill="${INK}"/>
    <rect x="346" y="762" width="70" height="88" rx="8" fill="${SKY}"/>
  </g>
  ${ruler()}`;
}

function dailyConvenience() {
  const arc = (r: number) =>
    `M${(270 + r * 0.906).toFixed(1)} ${(325 - r * 0.423).toFixed(1)}A${r} ${r} 0 0 1 ${(270 + r * 0.707).toFixed(1)} ${(325 + r * 0.707).toFixed(1)}`;
  return `
  <circle id="field" cx="540" cy="520" r="250" fill="${ORANGE}"/>
  <g id="phone">
    <rect x="100" y="170" width="170" height="310" rx="26" fill="${INK}"/>
    <rect x="114" y="196" width="142" height="258" rx="8" fill="${PAPER}"/>
    <g id="key" fill="none" stroke="${ORANGE}" stroke-width="14">
      <circle cx="185" cy="272" r="28"/>
      <path d="M185 300V408M185 366h30M185 401h22"/>
    </g>
  </g>
  <path id="signal" d="${arc(70)}${arc(120)}${arc(170)}" fill="none" stroke="${INK}" stroke-width="8"/>
  <g id="garage">
    <path d="M760 660V400H900V660" fill="none" stroke="${INK}" stroke-width="12"/>
    <path d="M772 432H888M772 462H888M772 492H888" stroke="${INK}" stroke-width="6"/>
  </g>
  <g id="vehicle">
    ${carSide(300, 536, 400, PAPER, ORANGE)}
    <circle cx="505" cy="598" r="9" fill="${ORANGE}"/>
  </g>
  <path id="ground" d="M60 660H900" stroke="${INK}" stroke-width="4"/>
  <path id="direction" d="M130 730l30 30-30 30M190 730l30 30-30 30M250 730l30 30-30 30" fill="none" stroke="${INK}" stroke-width="8"/>
  ${ruler()}`;
}

function comfortDrive() {
  let vents = "";
  for (let j = 0; j < 8; j++)
    for (let i = 0; i < 3; i++)
      vents += `<circle cx="${280 + i * 20}" cy="${262 + j * 36}" r="5" fill="${PAPER}"/>`;
  const air = (y: number, end: number) =>
    `M900 ${y}H700C620 ${y} 600 ${y + 50} 520 ${y + 50}H${end}`;
  const heat = (x: number) => `M${x} 508c-26-24 26-48 0-72`;
  return `
  <circle id="field" cx="470" cy="420" r="280" fill="${LAVENDER}"/>
  <g id="airflow" fill="none" stroke="${INK}" stroke-width="5">
    <path d="${air(215, 430)}${air(275, 410)}${air(335, 440)}"/>
  </g>
  <g id="seat">
    <g transform="rotate(-12 300 590)">
      <rect x="262" y="78" width="76" height="92" rx="30" fill="${INK}"/>
      <rect x="250" y="180" width="100" height="420" rx="50" fill="${INK}"/>
      ${vents}
    </g>
    <rect x="280" y="540" width="370" height="90" rx="45" fill="${INK}" transform="rotate(-5 300 590)"/>
    <path d="M350 648H600M330 722H620" stroke="${INK}" stroke-width="14"/>
    <rect x="455" y="648" width="40" height="74" fill="${INK}"/>
  </g>
  <path id="warmth" d="${heat(520)}${heat(572)}${heat(624)}" fill="none" stroke="${ORANGE}" stroke-width="9"/>
  <g id="road-motion" fill="none" stroke="${INK}">
    <path d="M60 812H280C360 812 380 772 460 772S560 812 640 812H900" stroke-width="8"/>
    <path d="M700 842H900M760 862H900" stroke-width="3"/>
  </g>
  ${ruler()}`;
}

function softwareTech() {
  let sequence = "";
  for (let i = 0; i < 5; i++)
    sequence +=
      i < 3
        ? `<rect x="${130 + i * 64}" y="96" width="44" height="44" fill="${INK}"/>`
        : `<rect x="${133 + i * 64}" y="99" width="38" height="38" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>`;
  let voice = "";
  [40, 90, 140, 90, 40].forEach((h, i) => {
    voice += `M${720 + i * 34} ${745 - h / 2}v${h}`;
  });
  return `
  <circle id="field" cx="520" cy="380" r="270" fill="${TEAL}"/>
  <g id="update-sequence">
    ${sequence}
    <path d="M430 118H500V184M486 170l14 14 14-14" fill="none" stroke="${INK}" stroke-width="6"/>
  </g>
  <g id="display">
    <rect x="220" y="200" width="560" height="330" rx="18" fill="${INK}"/>
    <rect x="236" y="216" width="528" height="298" rx="4" fill="${PAPER}"/>
    <rect x="252" y="232" width="120" height="266" fill="${TEAL}"/>
    <rect x="392" y="232" width="200" height="22" fill="${INK}"/>
    <path d="M392 280H748M392 304H690" stroke="${GREY}" stroke-width="8"/>
    <rect x="392" y="344" width="70" height="70" fill="${GREY}"/>
    <rect x="478" y="344" width="70" height="70" fill="${GREY}"/>
    <rect x="392" y="430" width="156" height="68" fill="${GREY}"/>
    <circle cx="668" cy="420" r="54" fill="none" stroke="${GREY}" stroke-width="14"/>
    <path d="M668 366A54 54 0 1 1 614 420" fill="none" stroke="${INK}" stroke-width="14"/>
    <rect x="480" y="530" width="40" height="34" fill="${INK}"/>
  </g>
  <g id="connections" fill="none" stroke="${INK}" stroke-width="3">
    <path d="M500 564V612M205 640V612H788V650M500 612V670"/>
  </g>
  ${node(500, 612)}
  <g id="devices">
    <rect x="150" y="640" width="110" height="200" rx="18" fill="${INK}"/>
    <rect x="162" y="660" width="86" height="160" rx="4" fill="${PAPER}"/>
    <rect x="174" y="674" width="62" height="40" fill="${TEAL}"/>
    <path d="M174 734H236M174 754H218" stroke="${GREY}" stroke-width="8"/>
    <rect x="425" y="670" width="150" height="150" rx="14" fill="${INK}"/>
    <path d="M480 712V778L536 745Z" fill="${PAPER}"/>
    <path d="${voice}" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  </g>
  ${ruler()}`;
}

const artworks: Art[] = [
  {
    file: "a-automated-driving-hero",
    background: SKY,
    desktopX: 0,
    // Centred on the circuit; phones show the lower square of the portrait.
    place: {
      desktop: { x: 78, y: -117, scale: 1.35 },
      mobile: { x: -135, y: 225, scale: 1.15 },
    },
    draw: automatedDriving,
  },
  {
    file: "b-price-ownership",
    background: PAPER,
    desktopX: 620,
    draw: priceOwnership,
  },
  {
    file: "c-range-charging",
    background: PAPER,
    desktopX: 620,
    draw: rangeCharging,
  },
  {
    file: "d-space-safety",
    background: PAPER,
    desktopX: 620,
    draw: spaceSafety,
  },
  {
    file: "e-daily-convenience",
    background: PAPER,
    desktopX: 620,
    draw: dailyConvenience,
  },
  {
    file: "f-comfort-drive",
    background: PAPER,
    desktopX: 620,
    draw: comfortDrive,
  },
  {
    file: "g-software-tech",
    background: PAPER,
    desktopX: 620,
    draw: softwareTech,
  },
];

function svg(art: Art, format: Format, animate: boolean) {
  const size = format === "desktop" ? DESKTOP : MOBILE;
  const { x, y, scale } = art.place?.[format] ?? {
    x: format === "desktop" ? art.desktopX : 0,
    y: format === "desktop" ? 0 : MOBILE.h - BOX.h - 30,
    scale: 1,
  };
  const drawn = art.draw(format, {
    left: Math.floor(-x / scale),
    top: Math.floor(-y / scale),
    right: Math.ceil((size.w - x) / scale),
    bottom: Math.ceil((size.h - y) / scale),
  });
  const body = (typeof drawn === "string" ? drawn : drawn.body)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
  const style =
    animate && typeof drawn !== "string"
      ? `<style>${drawn.style}</style>\n`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.w} ${size.h}" width="${size.w}" height="${size.h}">
${style}<rect id="background" width="${size.w}" height="${size.h}" fill="${art.background}"/>
<g id="artwork" transform="translate(${x} ${y})${scale === 1 ? "" : ` scale(${scale})`}" stroke-linecap="butt">
${body}
</g>
</svg>
`;
}

const out = path.join(process.cwd(), "public/media/chapters");
fs.mkdirSync(out, { recursive: true });
let bytes = 0,
  files = 0;
function write(name: string, text: string) {
  bytes += Buffer.byteLength(text);
  files += 1;
  fs.writeFileSync(path.join(out, `${name}.svg`), text);
}
for (const art of artworks)
  for (const format of ["desktop", "mobile"] as const) {
    const moving = svg(art, format, true),
      still = svg(art, format, false);
    write(`${art.file}-${format}`, moving);
    // A moving artwork also ships its resting frame, shown when paused.
    if (moving !== still) write(`${art.file}-${format}-still`, still);
  }
console.log(
  `Chapter artwork written: ${files} SVG files, ${(bytes / 1e3).toFixed(1)} kB.`,
);
