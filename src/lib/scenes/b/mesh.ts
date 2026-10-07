/**
 * Solid shapes for the B scenes, as triangle meshes with smooth normals.
 * Everything a scene shows is built from these: softened boxes, turned
 * profiles, tubes and lumpy spheres.
 */
import {
  TAU,
  cross,
  direct,
  hash,
  normalMatrix,
  sub,
  transform,
  unit,
  type M4,
  type V2,
  type V3,
} from "./math";

export type Mesh = {
  /** Identity for the renderer's cache of uploaded geometry. */
  key: number;
  pos: Float32Array;
  nrm: Float32Array;
  /** Four spare numbers per vertex; what they mean is up to the material. */
  aux: Float32Array;
  idx: Uint32Array;
  /** A coarse stand-in, drawn where WebGL is not available. */
  lo?: Mesh;
  /**
   * For a shape that is rebuilt every frame (a cable in motion): a name for
   * the one buffer it re-uses, so the renderer does not keep every version.
   */
  slot?: string;
};
type Aux = [number, number, number, number];
const PLAIN: Aux = [0, 0, 0, 0];

let made = 0;
/** Collects vertices and triangles, then hands back a mesh. */
export class Shape {
  pos: number[] = [];
  nrm: number[] = [];
  aux: number[] = [];
  idx: number[] = [];
  get count() {
    return this.pos.length / 3;
  }
  vertex(p: V3, n: V3, aux: Aux = PLAIN) {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    this.aux.push(aux[0], aux[1], aux[2], aux[3]);
    return this.count - 1;
  }
  tri(a: number, b: number, c: number) {
    this.idx.push(a, b, c);
  }
  quad(a: number, b: number, c: number, d: number) {
    this.idx.push(a, b, c, a, c, d);
  }
  /** Adds another mesh, moved by `m`. */
  add(mesh: Mesh, m?: M4) {
    const base = this.count,
      turn = m && normalMatrix(m);
    for (let i = 0; i < mesh.pos.length; i += 3) {
      const p: V3 = [mesh.pos[i], mesh.pos[i + 1], mesh.pos[i + 2]],
        n: V3 = [mesh.nrm[i], mesh.nrm[i + 1], mesh.nrm[i + 2]];
      const q = m ? transform(m, p) : p;
      const r = turn
        ? unit([
            turn[0] * n[0] + turn[3] * n[1] + turn[6] * n[2],
            turn[1] * n[0] + turn[4] * n[1] + turn[7] * n[2],
            turn[2] * n[0] + turn[5] * n[1] + turn[8] * n[2],
          ])
        : n;
      this.pos.push(q[0], q[1], q[2]);
      this.nrm.push(r[0], r[1], r[2]);
    }
    for (const v of mesh.aux) this.aux.push(v);
    for (const v of mesh.idx) this.idx.push(v + base);
    return this;
  }
  /** Replaces every normal with the average of the faces round its vertex. */
  smooth() {
    const sum = new Float64Array(this.pos.length);
    const at = (i: number): V3 => [
      this.pos[i * 3],
      this.pos[i * 3 + 1],
      this.pos[i * 3 + 2],
    ];
    for (let i = 0; i < this.idx.length; i += 3) {
      const [a, b, c] = [this.idx[i], this.idx[i + 1], this.idx[i + 2]];
      const n = cross(sub(at(b), at(a)), sub(at(c), at(a)));
      for (const v of [a, b, c]) {
        sum[v * 3] += n[0];
        sum[v * 3 + 1] += n[1];
        sum[v * 3 + 2] += n[2];
      }
    }
    for (let i = 0; i < this.count; i++) {
      const n = unit([sum[i * 3], sum[i * 3 + 1], sum[i * 3 + 2]]);
      this.nrm[i * 3] = n[0];
      this.nrm[i * 3 + 1] = n[1];
      this.nrm[i * 3 + 2] = n[2];
    }
    return this;
  }
  done(lo?: Mesh): Mesh {
    return {
      key: ++made,
      pos: new Float32Array(this.pos),
      nrm: new Float32Array(this.nrm),
      aux: new Float32Array(this.aux),
      idx: new Uint32Array(this.idx),
      lo,
    };
  }
}
/** Several meshes as one, each moved by its own matrix. */
export function merge(parts: [Mesh, M4?][], lo?: Mesh): Mesh {
  const shape = new Shape();
  for (const [mesh, m] of parts) shape.add(mesh, m);
  return shape.done(lo);
}
/** The same mesh with its spare numbers set, for a material that reads them. */
export function tagged(mesh: Mesh, aux: Aux): Mesh {
  const out = new Float32Array(mesh.aux.length);
  for (let i = 0; i < out.length; i += 4) out.set(aux, i);
  return { ...mesh, key: ++made, aux: out };
}

/**
 * A box with softened edges, standing on z = 0 and centred on x and y. The
 * softening is what makes a block read as a model rather than a diagram: its
 * edges catch the light.
 */
export function block(
  width: number,
  depth: number,
  height: number,
  soft = 0.02,
): Mesh {
  const half: V3 = [width / 2, depth / 2, height / 2];
  const r = Math.min(soft, half[0], half[1], half[2]);
  const shape = new Shape();
  const steps = (h: number) => [-h, -h + r, h - r, h];
  for (let axis = 0; axis < 3; axis++)
    for (const sign of [1, -1]) {
      const u = (axis + 1) % 3,
        v = (axis + 2) % 3;
      const grid: number[] = [];
      for (const cu of steps(half[u]))
        for (const cv of steps(half[v])) {
          const p: V3 = [0, 0, 0];
          p[axis] = sign * half[axis];
          p[u] = cu;
          p[v] = cv;
          const inner = p.map((c, i) =>
            Math.max(-(half[i] - r), Math.min(half[i] - r, c)),
          ) as V3;
          const n = unit(sub(p, inner));
          grid.push(
            shape.vertex(
              [
                inner[0] + n[0] * r,
                inner[1] + n[1] * r,
                inner[2] + n[2] * r + half[2],
              ],
              n,
            ),
          );
        }
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          const a = grid[i * 4 + j],
            b = grid[(i + 1) * 4 + j],
            c = grid[(i + 1) * 4 + j + 1],
            d = grid[i * 4 + j + 1];
          if (sign > 0) shape.quad(a, b, c, d);
          else shape.quad(a, d, c, b);
        }
    }
  return shape.done();
}

/**
 * A profile of [radius, height] turned about the z axis. Give the profile
 * from the bottom up for a solid seen from outside.
 */
export function turned(profile: V2[], sides = 28, sweep = TAU): Mesh {
  const shape = new Shape();
  const closed = sweep >= TAU - 1e-6;
  const columns = closed ? sides : sides + 1;
  for (let i = 0; i < profile.length; i++) {
    const before = profile[Math.max(0, i - 1)],
      after = profile[Math.min(profile.length - 1, i + 1)];
    // The outward normal is the profile's tangent turned a quarter.
    const tr = after[0] - before[0],
      tz = after[1] - before[1];
    const l = Math.hypot(tr, tz) || 1;
    for (let s = 0; s < columns; s++) {
      const a = (s / sides) * sweep;
      const cos = Math.cos(a),
        sin = Math.sin(a);
      shape.vertex(
        [profile[i][0] * cos, profile[i][0] * sin, profile[i][1]],
        [(tz / l) * cos, (tz / l) * sin, -tr / l],
      );
    }
  }
  for (let i = 0; i < profile.length - 1; i++)
    for (let s = 0; s < (closed ? sides : sides); s++) {
      const t = closed ? (s + 1) % sides : s + 1;
      shape.quad(
        i * columns + s,
        i * columns + t,
        (i + 1) * columns + t,
        (i + 1) * columns + s,
      );
    }
  return shape.done();
}
/** An upright cylinder with softened rims, standing on z = 0. */
export const post = (
  radius: number,
  height: number,
  soft = 0.015,
  sides = 24,
) =>
  turned(
    [
      [0, 0],
      [radius - soft, 0],
      [radius, soft],
      [radius, height - soft],
      [radius - soft, height],
      [0, height],
    ],
    sides,
  );

/** A round tube along a path. */
export function tube(path: V3[], radius: number, sides = 8): Mesh {
  const shape = new Shape();
  let normal: V3 = [0, 0, 1];
  path.forEach((p, i) => {
    const forward = unit(
      sub(path[Math.min(path.length - 1, i + 1)], path[Math.max(0, i - 1)]),
    );
    // Carry the frame along the path so the tube never twists.
    let side = cross(forward, normal);
    if (Math.hypot(...side) < 1e-4) side = cross(forward, [1, 0, 0]);
    side = unit(side);
    normal = unit(cross(side, forward));
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * TAU;
      const n: V3 = [
        side[0] * Math.cos(a) + normal[0] * Math.sin(a),
        side[1] * Math.cos(a) + normal[1] * Math.sin(a),
        side[2] * Math.cos(a) + normal[2] * Math.sin(a),
      ];
      shape.vertex(
        [p[0] + n[0] * radius, p[1] + n[1] * radius, p[2] + n[2] * radius],
        n,
      );
    }
  });
  for (let i = 0; i < path.length - 1; i++)
    for (let s = 0; s < sides; s++) {
      const t = (s + 1) % sides;
      shape.quad(
        i * sides + s,
        (i + 1) * sides + s,
        (i + 1) * sides + t,
        i * sides + t,
      );
    }
  return shape.done();
}

/**
 * A sphere, stretched to `size` and roughened by `lumps`: foliage, heads,
 * anything soft. `seed` picks the lumps.
 */
export function ball(
  size: V3,
  lumps = 0,
  seed = 1,
  rows = 10,
  columns = 16,
): Mesh {
  const shape = new Shape();
  const bump = (x: number, y: number, z: number) => {
    if (!lumps) return 1;
    let v = 0;
    for (let k = 0; k < 5; k++) {
      const d = unit([
        hash(seed + k * 3.1) - 0.5,
        hash(seed + k * 5.7) - 0.5,
        hash(seed + k * 9.3) - 0.5,
      ]);
      v += Math.max(0, d[0] * x + d[1] * y + d[2] * z) ** 3;
    }
    return 1 - lumps * 0.5 + lumps * v * 0.6;
  };
  for (let r = 0; r <= rows; r++) {
    const lat = (r / rows - 0.5) * Math.PI;
    for (let c = 0; c < columns; c++) {
      const lon = (c / columns) * TAU;
      const x = Math.cos(lat) * Math.cos(lon),
        y = Math.cos(lat) * Math.sin(lon),
        z = Math.sin(lat);
      const k = bump(x, y, z);
      shape.vertex(
        [x * size[0] * k, y * size[1] * k, z * size[2] * k],
        [x, y, z],
      );
    }
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++) {
      const t = (c + 1) % columns;
      shape.quad(
        r * columns + c,
        r * columns + t,
        (r + 1) * columns + t,
        (r + 1) * columns + c,
      );
    }
  if (lumps) shape.smooth();
  return shape.done();
}

/** A flat sheet on z = 0, facing up. */
export function sheet(width: number, depth: number): Mesh {
  const shape = new Shape();
  const up: V3 = [0, 0, 1];
  const a = shape.vertex([-width / 2, -depth / 2, 0], up),
    b = shape.vertex([width / 2, -depth / 2, 0], up),
    c = shape.vertex([width / 2, depth / 2, 0], up),
    d = shape.vertex([-width / 2, depth / 2, 0], up);
  shape.quad(a, b, c, d);
  return shape.done();
}

/** The direction a mesh's vertex normal points after `m`. */
export const turnedNormal = (m: M4, n: V3) => unit(direct(m, n));
