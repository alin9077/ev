/**
 * The B scenes without WebGL: the same frame painted on a 2D canvas as flat
 * shaded faces, back to front. Coarser than the real renderer, with no
 * shadows, but the scene and its labels still read.
 */
import { BODY, GLOW, WHEEL, type Frame } from "./gl";
import { cross, css, dot, sub, transform, unit, type V3 } from "./math";
import type { Camera } from "./stage";

/** The most triangles a mesh may have to be painted as it is. */
const LIMIT = 900;

export function flat(ctx: CanvasRenderingContext2D, frame: Frame, cam: Camera) {
  const { light } = frame;
  ctx.fillStyle = css(light.ground);
  ctx.fillRect(0, 0, frame.width, frame.height);
  const faces: { depth: number; xy: number[]; fill: string }[] = [];
  for (const item of frame.items) {
    const { mat } = item;
    const mesh =
      item.mesh.lo ?? (item.mesh.idx.length <= LIMIT * 3 ? item.mesh : null);
    if (!mesh || (mat.alpha ?? 1) < 0.5 || (mat.ghost ?? 0) > 0.5) continue;
    if (mat.faces === "inside") continue;
    const base: V3 =
      mat.kind === WHEEL
        ? (mat.color2 ?? mat.color)
        : mat.kind === GLOW
          ? [
              mat.color[0] * (mat.p?.[0] ?? 1),
              mat.color[1] * (mat.p?.[0] ?? 1),
              mat.color[2] * (mat.p?.[0] ?? 1),
            ]
          : mat.color;
    const world: V3[] = [],
      screen: V3[] = [];
    for (let i = 0; i < mesh.pos.length; i += 3) {
      const p = transform(item.at, [
        mesh.pos[i],
        mesh.pos[i + 1],
        mesh.pos[i + 2],
      ]);
      world.push(p);
      screen.push(cam.project(p));
    }
    for (let i = 0; i < mesh.idx.length; i += 3) {
      const [a, b, c] = [mesh.idx[i], mesh.idx[i + 1], mesh.idx[i + 2]];
      const [p, q, r] = [screen[a], screen[b], screen[c]];
      const area =
        (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      if (mat.faces !== "both" && area >= 0) continue;
      if (Math.abs(area) < 0.5) continue;
      let shade = 1;
      if (mat.kind !== GLOW) {
        const n = unit(cross(sub(world[b], world[a]), sub(world[c], world[a])));
        const up = n[2] * 0.5 + 0.5;
        shade =
          light.bounce[1] +
          (light.sky[1] - light.bounce[1]) * up +
          light.sunColour[1] * Math.max(0, dot(n, light.sun));
        // The body's glass, where it would be: anything facing well upward.
        if (mat.kind === BODY && !(mat.s?.[3] ?? 0) && n[2] > 0.55)
          shade *= 0.5;
      }
      faces.push({
        depth: p[2] + q[2] + r[2],
        xy: [p[0], p[1], q[0], q[1], r[0], r[1]],
        fill: css([base[0] * shade, base[1] * shade, base[2] * shade]),
      });
    }
  }
  faces.sort((a, b) => b.depth - a.depth);
  ctx.lineJoin = "round";
  ctx.lineWidth = 1;
  for (const face of faces) {
    ctx.fillStyle = face.fill;
    ctx.strokeStyle = face.fill;
    ctx.beginPath();
    ctx.moveTo(face.xy[0], face.xy[1]);
    ctx.lineTo(face.xy[2], face.xy[3]);
    ctx.lineTo(face.xy[4], face.xy[5]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
