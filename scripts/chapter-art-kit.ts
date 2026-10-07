/** Palette and primitives shared by every chapter artwork. */
export const PAPER = "#F5F5F0",
  INK = "#172326",
  SKY = "#77B9D5",
  DEEP = "#245268",
  GREY = "#C5CBD0",
  GREEN = "#BDDB6A",
  YELLOW = "#F1CF50",
  ORANGE = "#ECA266",
  LAVENDER = "#ADB2D6",
  TEAL = "#83C7C2";

/** Fine measuring rule shared by all seven artworks. */
export function ruler(from = 60, to = 900, opacity = 1) {
  let ticks = "";
  for (let x = from; x <= to; x += 60) ticks += `M${x} 886v-10`;
  return `<path d="M${from} 886H${to}${ticks}" fill="none" stroke="${INK}" stroke-width="2" opacity="${opacity}"/>`;
}

/** Plan view, 60 × 130, nose towards −y before rotation. */
export function carTop(
  cx: number,
  cy: number,
  rot: number,
  scale: number,
  body: string,
  glass: string,
) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale})">
    <rect x="-36" y="-30" width="72" height="10" rx="3" fill="${body}"/>
    <rect x="-30" y="-65" width="60" height="130" rx="17" fill="${body}"/>
    <path d="M-22-32h44l-4 20h-36ZM-18 32h36l3 14h-42Z" fill="${glass}"/>
  </g>`;
}

/** Four corner marks: a detected object, drawn without any sensor glow. */
export function brackets(x: number, y: number, w: number, h: number, c = 14) {
  const r = x + w,
    b = y + h;
  return `<path d="M${x} ${y + c}V${y}h${c}M${r - c} ${y}h${c}v${c}M${r} ${b - c}v${c}h${-c}M${x + c} ${b}h${-c}v${-c}" fill="none" stroke="${INK}" stroke-width="3"/>`;
}
