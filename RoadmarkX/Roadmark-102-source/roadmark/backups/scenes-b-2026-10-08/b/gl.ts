/**
 * The renderer for the B scenes: a small WebGL2 pipeline that lights a white
 * model the way a studio would. One soft sun with a shadow map, a sky that
 * fills from every side, and ambient shade worked out from a height map taken
 * from straight above, so things sit on the ground instead of floating over
 * it. One context is shared by every scene on the page; each frame is drawn
 * here and then copied to that scene's own canvas.
 */
import {
  compose,
  lookAt,
  normalMatrix,
  orthographic,
  type M4,
  type V3,
} from "./math";
import type { Mesh } from "./mesh";

/** Which shading a material uses. */
export const CLAY = 0,
  GLOSS = 1,
  GLOW = 2,
  BODY = 3,
  WHEEL = 4,
  GROUND = 5;

export type Material = {
  kind: number;
  /** Linear-light colours; what the second one does depends on the kind. */
  color: V3;
  color2?: V3;
  /** Up to four sets of four numbers, read by the kind's shading. */
  p?: number[];
  q?: number[];
  r?: number[];
  s?: number[];
  /** Below 1 the item is blended over what is behind it. */
  alpha?: number;
  /** 0–1: fades the faces that look at the viewer, leaving a glass shell. */
  ghost?: number;
  /** Which faces to draw: the outside (default), the inside, or both. */
  faces?: "outside" | "inside" | "both";
};
export type Item = {
  mesh: Mesh;
  at: M4;
  mat: Material;
  /** Whether it shades the ground: on unless switched off. */
  cast?: boolean;
  /**
   * Whether it also darkens what is beneath and beside it. Off for things
   * that stand clear of the ground, like the crown of a tree.
   */
  shades?: boolean;
};
export type Lighting = {
  /** Unit vector towards the sun, and its colour. */
  sun: V3;
  sunColour: V3;
  /** Light from above, light bounced from below, and the floor's own colour. */
  sky: V3;
  bounce: V3;
  ground: V3;
  /** How soft the sun's shadow edge is, in metres. */
  soft: number;
  /** Ambient shade: how far it looks, in metres, and how dark it goes. */
  shade: [number, number];
  grain: number;
};
export type Frame = {
  width: number;
  height: number;
  viewProj: M4;
  eye: V3;
  /** The middle of what is in view, and how far from it things are lit. */
  focus: V3;
  reach: number;
  light: Lighting;
  items: Item[];
};

const VERTEX = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNrm;
layout(location=2) in vec4 aAux;
uniform mat4 uModel, uViewProj;
uniform mat3 uNormal;
out vec3 vW, vN, vO;
out vec4 vAux;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz;
  vN = uNormal * aNrm;
  vO = aPos;
  vAux = aAux;
  gl_Position = uViewProj * w;
}`;

const DEPTH_FRAGMENT = `#version 300 es
precision highp float;
void main() {}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler2DShadow;
in vec3 vW, vN, vO;
in vec4 vAux;
uniform int uKind;
uniform vec3 uColor, uColor2;
uniform vec4 uP, uQ, uR, uS;
uniform float uAlpha, uGhost, uGrain;
uniform bool uCoverage;
uniform vec3 uEye, uSun, uSunCol, uSky, uBounce, uGround;
uniform sampler2DShadow uShadow;
uniform sampler2D uHeight;
uniform mat4 uLightVP;
uniform vec4 uMaps;
uniform vec4 uAo;
out vec4 o;
const float TAU = 6.28318530718;

float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
        mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
        mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
/* How much of the sun reaches a point: 16 taps on a turned disc. */
float sunlight(vec3 w, vec3 n) {
  vec4 l = uLightVP * vec4(w + n * 0.04, 1.0);
  vec3 c = l.xyz * 0.5 + 0.5;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0 || c.z > 1.0) return 1.0;
  float turn = ign(gl_FragCoord.xy) * TAU, sum = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float r = sqrt((fi + 0.5) / 16.0) * uMaps.w, a = fi * 2.39996323 + turn;
    sum += texture(uShadow, vec3(c.xy + vec2(cos(a), sin(a)) * r, c.z - 0.0009));
  }
  return sum / 16.0;
}
float heightAt(vec2 xy) {
  vec2 uv = (xy - uMaps.xy) * uMaps.z + 0.5;
  return uAo.x - texture(uHeight, uv).r * uAo.y;
}
/* How open a point is to the sky, judged from the heights around it. */
float openness(vec3 w, vec3 n) {
  float turn = ign(gl_FragCoord.xy + 31.7) * TAU, shut = 0.0, roof = 0.0;
  vec3 p = w + n * 0.035;
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float r = (0.1 + 0.9 * (fi + 0.5) / 12.0) * uAo.z, a = fi * 2.39996323 + turn;
    vec2 d = vec2(cos(a), sin(a)) * r;
    float rise = heightAt(p.xy + d) - p.z;
    shut += max(dot(normalize(vec3(d, rise)), n) - 0.14, 0.0);
    // Close by and well overhead: this point is under something.
    if (i < 5) roof += smoothstep(0.1, 0.3, rise);
  }
  float under = roof / 5.0 * smoothstep(0.35, 0.8, n.z);
  return (1.0 - min(0.92, shut / 12.0 * uAo.w)) * (1.0 - 0.62 * under);
}
/* What a shiny surface sees: a pale dome over the floor. */
vec3 dome(vec3 r) {
  vec3 above = mix(vec3(0.78, 0.80, 0.84), vec3(1.0), smoothstep(-0.05, 0.9, r.z));
  vec3 c = mix(uGround * 0.5, above, smoothstep(-0.1, 0.08, r.z));
  return c + uSunCol * 2.2 * pow(max(dot(r, uSun), 0.0), 36.0);
}
float band(float v, float lo, float hi, float aa) {
  return smoothstep(lo - aa, lo + aa, v) * (1.0 - smoothstep(hi - aa, hi + aa, v));
}
float stroke(float d, float half_, float aa) {
  return 1.0 - smoothstep(half_ - aa, half_ + aa, abs(d));
}

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(uEye - vW);
  float ndv = max(dot(n, v), 0.0);

  if (uKind == 2) {
    o = vec4(pow(uColor * uP.x, vec3(1.0 / 2.2)), uAlpha * (1.0 - vAux.x));
    return;
  }

  vec3 albedo = uColor;
  vec3 emit = vec3(0.0);
  float f0 = 0.0, flake = 0.0, cover = 1.0, sheen = 0.0, gleam = 0.42, lift = 0.0;

  if (uKind == 0) {
    // Clay: matte, optionally speckled like model foliage, optionally lit
    // from within in a second colour.
    if (uP.w > 0.0)
      albedo *= 1.0 - uP.w * (0.55 * noise3(vW * 31.0) + 0.45 * noise3(vW * 77.0));
    emit = uColor2 * uP.x;
    sheen = uP.y;
    emit += uColor2 * uP.z * pow(1.0 - ndv, 2.0);
    if (uQ.x > 0.0) {
      // Seams at a regular pitch, for a pack of cells.
      vec2 g = abs(fract(vO.xy / uQ.x + 0.5) - 0.5) * uQ.x;
      albedo *= 1.0 - 0.3 * (1.0 - smoothstep(0.004, 0.012, min(g.x, g.y)));
    }
  } else if (uKind == 1) {
    f0 = uP.x;
    flake = uP.y;
    emit = uColor2 * uP.z;
    // How much of the sky a glancing face returns; small parts want less.
    if (uP.w > 0.0) gleam = uP.w;
  } else if (uKind == 5) {
    // The floor falls off a little away from where the scene is looking.
    float far = length(vW.xy - uP.xy);
    albedo *= 1.0 - uP.w * smoothstep(uP.z * 0.4, uP.z * 1.6, far);
    if (uQ.y > 0.0) {
      // A map's dot grid, at a pitch that follows the view: as the camera
      // pulls away every other dot fades and the rest grow.
      float level = log2(uQ.x), whole = floor(level);
      vec2 fine = fract(vW.xy / exp2(whole) + 0.5) - 0.5;
      vec2 coarse = fract(vW.xy / exp2(whole + 1.0) + 0.5) - 0.5;
      float a = 1.0 - smoothstep(0.1, 0.16, length(fine));
      float b = 1.0 - smoothstep(0.1, 0.16, length(coarse) * 2.0);
      float c = 1.0 - smoothstep(0.1, 0.16, length(coarse));
      albedo *= 1.0 - uQ.y * mix(mix(b, a, 1.0 - (level - whole)), c, (level - whole) * 0.0);
    }
  } else if (uKind == 4) {
    // A wheel, in its own frame: the axle runs along y.
    float r = length(vO.xz);
    float aa = max(fwidth(r), 0.0015);
    float rim = uP.x;
    float tyre = smoothstep(rim - aa, rim + aa, r);
    gleam = 0.3;
    float t = clamp((r - 0.066) / (rim - 0.066), 0.0, 1.0);
    // Five spokes, each splitting in two as it reaches the rim, with a slight sweep.
    float a = atan(vO.z, vO.x) / TAU + 0.035 * t;
    float between = abs(fract(a * uP.y + 0.5) - 0.5) * 2.0;
    float ea = max(fwidth(between), 0.012);
    float apart = mix(0.0, 0.5, smoothstep(0.12, 1.0, t));
    float thick = mix(0.2, 0.085, smoothstep(0.0, 0.7, t));
    float spoke = 1.0 - smoothstep(thick - ea, thick + ea, abs(between - apart));
    float hub = 1.0 - smoothstep(0.066 - aa, 0.066 + aa, r);
    float lip = smoothstep(rim - 0.022 - aa, rim - 0.022 + aa, r);
    float face = step(0.0, vO.y);
    float metal = max(max(spoke, hub), lip) * face;
    // The spokes' flat faces are machined bright; their sides and the rest are dark.
    float bright = spoke * (1.0 - smoothstep(thick * 0.45, thick * 0.75, abs(between - apart))) * (1.0 - hub) * face;
    vec3 dark = uColor2;
    vec3 body = mix(uColor * 0.42, uColor * 1.9, bright * (1.0 - uP.w));
    albedo = mix(mix(dark * 0.6, body, metal), dark, tyre);
    f0 = mix(0.05 * metal, 0.0, tyre) * (1.0 - uP.w);
    flake = 0.3 * metal * (1.0 - tyre) * (1.0 - uP.w);
    sheen = 0.05 * tyre;
  } else if (uKind == 3) {
    // The car's body. s runs nose to tail in metres; q counts round the
    // section: 0-1 underside, 1-2 flank, 2-3 side glass, 3-4 roof.
    float s = vAux.x, q = vAux.y, z = vO.z, ay = abs(vO.y);
    float sa = clamp(fwidth(s), 0.0012, 0.02), za = clamp(fwidth(z), 0.0012, 0.02);
    float aa = min(sa + za, 0.02);
    float qa = clamp(fwidth(q), 0.004, 0.05);
    float clay = uS.w, len = uS.x;
    float zAxle = uP.z, archR = uP.w;
    vec2 fromFront = vec2(s - uP.x, z - zAxle), fromRear = vec2(s - uP.y, z - zAxle);
    float dw = min(length(fromFront), length(fromRear));
    float outer = step(0.6, ay);
    cover = 1.0 - outer * (1.0 - smoothstep(archR - aa, archR + aa, dw));

    // The tailgate is the same mesh drawn twice: once without it, once alone.
    float rail = 0.065;
    float gate = step(uR.z, s) * smoothstep(3.0 + rail - qa, 3.0 + rail + qa, q) * step(0.8, z);
    if (uQ.w > 0.5 && uQ.w < 1.5 && gate > 0.5) discard;
    if (uQ.w > 1.5 && gate < 0.5) discard;
    if (cover < 0.004) discard;

    // Dark trim: arch lips, sills, the lower bumpers and the scuttle.
    float lipR = archR + 0.046;
    float trim = outer * (1.0 - smoothstep(lipR - aa, lipR + aa, dw)) * step(z, zAxle + lipR + 0.02);
    float skirt = 0.275 + 0.27 * smoothstep(len - 0.72, len - 0.22, s) + 0.05 * (1.0 - smoothstep(0.1, 0.5, s));
    trim = max(trim, 1.0 - smoothstep(skirt - za, skirt + za, z));
    float cowl = uR.x - 0.17 * (1.0 - min(1.0, (ay * ay) / 0.5));
    float top = smoothstep(3.0 - qa, 3.0 + qa, q);
    trim = max(trim, top * band(s, cowl - 0.05, cowl + 0.012, aa) * step(ay, 0.74));

    // Glass: the band above the waist, and the canopy between the rails.
    float sideGlass = band(q, 2.03, 2.99, qa) * band(z, vAux.z, vAux.w, aa);
    float inboard = smoothstep(3.0 + rail - qa, 3.0 + rail + qa, q);
    float canopy = inboard * smoothstep(cowl + 0.012 - aa, cowl + 0.012 + aa, s)
      * (1.0 - smoothstep(uR.w - aa, uR.w + aa, s));
    float glass = max(sideGlass, canopy);
    float screen = canopy * (1.0 - smoothstep(uR.y - aa, uR.y + aa, s));
    float seam = canopy * max(stroke(s - uR.y, 0.011, aa), stroke(s - uR.z, 0.008, aa));

    // Lamps: a bar across the nose, pods low in its corners, a bar across the tail.
    float nose = 1.0 - smoothstep(0.46, 0.56, s);
    float bar = nose * stroke(z - uS.y + 0.035 * smoothstep(0.08, 0.55, s), 0.01, za)
      * max(step(q, 3.0), 1.0 - step(0.2, s));
    // Under the bar at each corner, an upright dark vent; lower, a wide intake.
    float pods = band(s, 0.11, 0.16, sa) * step(0.4, ay) * band(z, 0.47, 0.62, za);
    float intake = (1.0 - step(0.2, s)) * (1.0 - smoothstep(0.5 - 0.004, 0.5 + 0.004, ay)) * band(z, 0.34, 0.43, za);
    // The tail lamp: a wedge on each rear corner, joined by a thin bar across the tail.
    float reach = smoothstep(len - 0.56, len - 0.2, s);
    float lamp = step(len - 0.56, s) * stroke(z - uS.z - 0.01 + 0.05 * (1.0 - reach), 0.012 + 0.06 * reach * step(0.5, ay), za);
    float tailBar = step(len - 0.56, s) * stroke(z - uS.z - 0.012 + 0.05 * (1.0 - reach), 0.012, za);
    float plate = step(len - 0.14, s) * (1.0 - smoothstep(0.3 - 0.004, 0.3 + 0.004, ay)) * band(z, 0.86, 0.99, za);
    // A slim reflector low on each rear corner breaks up the bumper.
    float reflector = step(len - 0.3, s) * step(0.42, ay) * stroke(z - skirt - 0.07, 0.012, za);

    // Shut lines and handles, drawn in ink on the paint.
    float flank = step(1.0, q) * (1.0 - step(3.0, q));
    float doorA = uP.x + 0.46, doorB = 0.5 * (uP.x + uP.y) + 0.155, doorC = uP.y - 0.27;
    float lw = 0.0042;
    // The pillar line leans forward as it comes down to the sill.
    float lean = 0.08 * (1.0 - smoothstep(0.3, 1.15, z));
    float ink = flank * step(0.31, z) * (
      stroke(s - doorA + 0.02 * smoothstep(0.4, 1.1, z), lw, sa) +
      stroke(s - doorB + lean, lw, sa));
    float behind = step(s, uP.y);
    ink += flank * step(0.31, z) * mix(
      stroke(length(fromRear) - (archR + 0.085), lw, aa) * behind * step(z, 0.8),
      stroke(s - doorC, lw, sa), step(0.8, z));
    ink += flank * stroke(z - 0.335, lw, za) * band(s, doorA, doorC - 0.09, sa);
    float grip = vAux.z - 0.2;
    ink += flank * (band(s, doorB - 0.27, doorB - 0.07, sa) + band(s, doorC - 0.29, doorC - 0.09, sa))
      * stroke(z - grip, 0.012, za);
    // A small dark repeater on the wing, ahead of the door.
    ink += flank * band(s, doorA - 0.2, doorA - 0.04, sa) * stroke(z - 0.9 - 0.12 * (s - doorA + 0.2), 0.012, za);
    // The tailgate's outline: down each side from the lamps, and along its foot.
    float behindLamps = step(len - 0.5, s) * band(z, 0.8, uS.z - 0.04, za);
    ink += behindLamps * stroke(q - 3.0 - rail, 0.012, qa);
    ink += step(len - 0.2, s) * smoothstep(3.0 + rail - qa, 3.0 + rail + qa, q) * stroke(z - 0.8, lw, za);
    // The bonnet's edge, a hand's width in from each wing.
    ink += top * (1.0 - step(cowl - 0.05, s)) * step(0.34, s) * stroke(q - 3.1, 0.006, qa);
    ink = min(ink, 1.0) * (1.0 - glass) * (1.0 - trim);

    vec3 paint = uColor;
    vec3 glassTone = mix(vec3(0.012, 0.013, 0.016), vec3(0.04, 0.044, 0.05), screen);
    // Through the screen, faintly: the dashboard, then the front seats' shoulders.
    float dash = band(s, uR.x - 0.02, uR.x + 0.4, 0.12);
    float seats = band(s, uR.y - 0.34, uR.y + 0.1, 0.12) * band(ay, 0.14, 0.56, 0.1);
    glassTone += (vec3(0.022) * dash + vec3(0.016) * seats) * screen;
    // The roof glass carries a long soft sheen down its middle.
    glassTone += vec3(0.02) * canopy * (1.0 - screen) * (1.0 - smoothstep(0.0, 0.5, ay));
    vec3 trimTone = vec3(0.045, 0.046, 0.048);
    if (clay > 0.5) {
      glassTone = paint * 0.5;
      trimTone = paint * 0.62;
    }
    // Metallic paint falls away towards the sill and lifts along the shoulder.
    float low = smoothstep(1.02, 0.28, z) * flank;
    albedo = paint * (1.0 - 0.2 * low) * (1.0 - 0.62 * ink);
    // On dark paint a shut line shows as a pale edge, not a darker one.
    float deep = 1.0 - smoothstep(0.02, 0.2, dot(paint, vec3(0.33)));
    albedo += vec3(0.05, 0.052, 0.056) * ink * deep * (1.0 - clay);
    albedo = mix(albedo, paint * 0.62, plate * (1.0 - clay));
    albedo = mix(albedo, mix(vec3(0.16, 0.02, 0.02), paint * 0.7, clay), reflector);
    albedo = mix(albedo, trimTone, trim);
    albedo = mix(albedo, trimTone, max(pods, intake) * (1.0 - trim));
    albedo = mix(albedo, glassTone, glass);
    albedo = mix(albedo, trimTone * 0.6, seam);
    float shiny = 1.0 - clay;
    f0 = mix(0.05, 0.075, glass) * (1.0 - trim * 0.6);
    f0 = mix(f0, 0.012, clay);
    flake = 0.5 * shiny * (1.0 - glass) * (1.0 - trim);
    // Polished paint picks up the sky on whatever faces it.
    lift = mix(0.16, 0.06, deep) * shiny * (1.0 - glass) * (1.0 - trim)
      + 0.035 * glass * shiny * (1.0 - deep);
    // Black paint lives on its reflections; black glass sits a shade flatter.
    f0 = mix(f0, f0 * 1.35, deep * (1.0 - glass) * shiny);
    albedo = mix(albedo, albedo * 0.55, deep * glass * shiny);
    sheen = 0.03;
    // Lamps glow by their own settings.
    vec3 lens = mix(vec3(0.62, 0.64, 0.66), paint * 0.8, clay);
    albedo = mix(albedo, lens, bar);
    emit += vec3(1.0, 0.98, 0.94) * bar * uQ.y * 1.6 * shiny;
    vec3 red = mix(vec3(0.2, 0.012, 0.014), paint * 0.66, clay);
    // The lamp's housing is smoked; only the bar through it is red.
    albedo = mix(albedo, mix(vec3(0.03, 0.012, 0.014), paint * 0.6, clay), lamp);
    albedo = mix(albedo, red, tailBar);
    emit += vec3(1.0, 0.05, 0.04) * tailBar * uQ.z * 1.5 * shiny;
    f0 = mix(f0, 0.07, max(bar, lamp) * shiny);
    gleam = mix(mix(0.58, 0.74, deep), mix(0.66, 0.42, deep), glass) * shiny;
  }

  float lit = sunlight(vW, n);
  float open = openness(vW, n);
  float ndl = max(dot(n, uSun), 0.0);
  vec3 ambient = mix(uBounce, uSky, n.z * 0.5 + 0.5) * open;
  vec3 c = albedo * (ambient + uSunCol * ndl * lit);
  vec3 h = normalize(uSun + v);
  float ndh = max(dot(n, h), 0.0);
  c += albedo * flake * pow(ndh, 9.0) * (0.35 + 0.65 * lit);
  c += vec3(sheen) * pow(ndh, 24.0) * lit;
  c += vec3(lift) * smoothstep(0.2, 0.95, n.z) * open;
  if (f0 > 0.0) {
    float fres = f0 + (max(gleam, f0) - f0) * pow(1.0 - ndv, 5.0);
    c = mix(c, dome(reflect(-v, n)) * mix(0.5, 1.0, open), fres);
    c += uSunCol * pow(ndh, 260.0) * 14.0 * f0 * lit;
  }
  c += emit;
  float alpha = uAlpha;
  if (uGhost > 0.0) {
    float edge = pow(1.0 - ndv, 2.2);
    alpha *= mix(1.0, 0.05 + 0.5 * edge, uGhost);
    // Whatever its paint, a shell seen through is the same cool glass.
    c = mix(c, vec3(0.7, 0.71, 0.74), 0.86 * uGhost);
  }
  c += (ign(gl_FragCoord.xy + 7.3) - 0.5) * uGrain;
  o = vec4(pow(max(c, 0.0), vec3(1.0 / 2.2)), uCoverage ? cover : alpha * cover);
}`;

type Program = {
  handle: WebGLProgram;
  at: (name: string) => WebGLUniformLocation | null;
};
type Uploaded = {
  vao: WebGLVertexArrayObject;
  buffers: WebGLBuffer[];
  count: number;
  used: number;
};
type Target = { fbo: WebGLFramebuffer; texture: WebGLTexture; size: number };
type State = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  main: Program;
  depth: Program;
  meshes: Map<number | string, Uploaded>;
  shadow: Target;
  height: Target;
  tick: number;
};

const SHADOW_SIZE = 2048,
  HEIGHT_SIZE = 1024;
/** The height map looks down from here, over this much depth, in metres. */
const TOP = 60,
  DEPTH = 64;

let state: State | undefined;
/** Set once WebGL2 has been tried and is not to be had. */
let unavailable = false;

function program(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string,
): Program {
  const handle = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader) || "shader failed");
    gl.attachShader(handle, shader);
  }
  gl.linkProgram(handle);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(handle) || "link failed");
  const found = new Map<string, WebGLUniformLocation | null>();
  return {
    handle,
    at: (name) => {
      if (!found.has(name))
        found.set(name, gl.getUniformLocation(handle, name));
      return found.get(name)!;
    },
  };
}
/** A square depth texture to draw into: the sun's view, or the view from above. */
function target(
  gl: WebGL2RenderingContext,
  size: number,
  compare: boolean,
): Target {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, size, size);
  const filter = compare ? gl.LINEAR : gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (compare) {
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_COMPARE_MODE,
      gl.COMPARE_REF_TO_TEXTURE,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  }
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.drawBuffers([gl.NONE]);
  gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, texture, size };
}

function start(): State | undefined {
  if (state || unavailable) return state;
  if (typeof document === "undefined") {
    unavailable = true;
    return undefined;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("no WebGL2");
    state = {
      canvas,
      gl,
      main: program(gl, VERTEX, FRAGMENT),
      depth: program(gl, VERTEX, DEPTH_FRAGMENT),
      meshes: new Map(),
      shadow: target(gl, SHADOW_SIZE, true),
      height: target(gl, HEIGHT_SIZE, false),
      tick: 0,
    };
    // A lost context takes everything uploaded with it: start again when asked.
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      state = undefined;
    });
  } catch (error) {
    unavailable = true;
    if (typeof console !== "undefined")
      console.warn("Scenes are drawn without WebGL:", error);
  }
  return state;
}
/** Whether frames can be rendered here at all. */
export const canRender = () => !!start();

function upload(st: State, mesh: Mesh): Uploaded {
  const { gl } = st;
  const name = mesh.slot ?? mesh.key;
  let held = st.meshes.get(name);
  const fresh = !held;
  if (!held) {
    const vao = gl.createVertexArray()!;
    const buffers = [0, 1, 2, 3].map(() => gl.createBuffer()!);
    gl.bindVertexArray(vao);
    [3, 3, 4].forEach((size, slot) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[slot]);
      gl.enableVertexAttribArray(slot);
      gl.vertexAttribPointer(slot, size, gl.FLOAT, false, 0, 0);
    });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[3]);
    held = { vao, buffers, count: 0, used: 0 };
    st.meshes.set(name, held);
  }
  if (fresh || mesh.slot) {
    const usage = mesh.slot ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    gl.bindVertexArray(held.vao);
    [mesh.pos, mesh.nrm, mesh.aux].forEach((data, slot) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, held.buffers[slot]);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, held.buffers[3]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, usage);
    held.count = mesh.idx.length;
  }
  held.used = st.tick;
  return held;
}
/** Frees geometry no scene has drawn for a while. */
function tidy(st: State) {
  if (st.tick % 900 || st.meshes.size < 400) return;
  for (const [name, held] of st.meshes)
    if (st.tick - held.used > 900) {
      st.gl.deleteVertexArray(held.vao);
      held.buffers.forEach((buffer) => st.gl.deleteBuffer(buffer));
      st.meshes.delete(name);
    }
}

const ZERO = [0, 0, 0, 0];
const solid = (item: Item) =>
  (item.mat.alpha ?? 1) >= 1 && !(item.mat.ghost && item.mat.ghost > 0);

/**
 * Draws a frame and returns the canvas it is on, with the picture in its
 * top-left `width` × `height` pixels; or nothing if WebGL2 cannot be used.
 */
export function render(frame: Frame): HTMLCanvasElement | undefined {
  const st = start();
  if (!st) return undefined;
  const { gl, canvas } = st;
  if (gl.isContextLost()) return undefined;
  st.tick += 1;
  const { width, height, light, focus } = frame;
  if (canvas.width < width || canvas.height < height) {
    canvas.width = Math.max(canvas.width, width);
    canvas.height = Math.max(canvas.height, height);
  }

  const reach = Math.max(4, frame.reach);
  const far = 80 + reach * 2;
  const lightVP = compose(
    orthographic(reach, reach, 1, far * 2),
    lookAt(
      [
        focus[0] + light.sun[0] * far,
        focus[1] + light.sun[1] * far,
        focus[2] + light.sun[2] * far,
      ],
      focus,
    ),
  );
  const topVP = compose(
    orthographic(reach, reach, 0.01, DEPTH),
    lookAt([focus[0], focus[1], TOP], [focus[0], focus[1], 0], [0, 1, 0]),
  );

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
  gl.disable(gl.SCISSOR_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

  // The sun's view and the view from above: depth only.
  gl.useProgram(st.depth.handle);
  for (const [map, matrix, offset] of [
    [st.shadow, lightVP, true],
    [st.height, topVP, false],
  ] as const) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, map.fbo);
    gl.viewport(0, 0, map.size, map.size);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    if (offset) {
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.5, 3);
    }
    gl.uniformMatrix4fv(st.depth.at("uViewProj"), false, matrix);
    for (const item of frame.items) {
      if (item.cast === false || (item.mat.alpha ?? 1) < 0.5) continue;
      if (!offset && item.shades === false) continue;
      const held = upload(st, item.mesh);
      gl.bindVertexArray(held.vao);
      gl.uniformMatrix4fv(st.depth.at("uModel"), false, item.at);
      gl.drawElements(gl.TRIANGLES, held.count, gl.UNSIGNED_INT, 0);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
  }

  // The picture itself.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, canvas.height - height, width, height);
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(0, canvas.height - height, width, height);
  const back = light.ground.map((c) => c ** (1 / 2.2));
  gl.clearColor(back[0], back[1], back[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const main = st.main;
  gl.useProgram(main.handle);
  gl.uniformMatrix4fv(main.at("uViewProj"), false, frame.viewProj);
  gl.uniformMatrix4fv(main.at("uLightVP"), false, lightVP);
  gl.uniform3fv(main.at("uEye"), frame.eye);
  gl.uniform3fv(main.at("uSun"), light.sun);
  gl.uniform3fv(main.at("uSunCol"), light.sunColour);
  gl.uniform3fv(main.at("uSky"), light.sky);
  gl.uniform3fv(main.at("uBounce"), light.bounce);
  gl.uniform3fv(main.at("uGround"), light.ground);
  gl.uniform1f(main.at("uGrain"), light.grain);
  gl.uniform4f(
    main.at("uMaps"),
    focus[0],
    focus[1],
    0.5 / reach,
    light.soft / (2 * reach),
  );
  // Ambient shade never looks nearer than three texels of the height map.
  gl.uniform4f(
    main.at("uAo"),
    TOP - 0.01,
    DEPTH - 0.01,
    Math.max(light.shade[0], (6 * reach) / HEIGHT_SIZE),
    light.shade[1],
  );
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, st.shadow.texture);
  gl.uniform1i(main.at("uShadow"), 0);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, st.height.texture);
  gl.uniform1i(main.at("uHeight"), 1);

  const draw = (item: Item) => {
    const { mat } = item;
    const held = upload(st, item.mesh);
    gl.bindVertexArray(held.vao);
    gl.uniformMatrix4fv(main.at("uModel"), false, item.at);
    gl.uniformMatrix3fv(main.at("uNormal"), false, normalMatrix(item.at));
    gl.uniform1i(main.at("uKind"), mat.kind);
    gl.uniform3fv(main.at("uColor"), mat.color);
    gl.uniform3fv(main.at("uColor2"), mat.color2 ?? mat.color);
    gl.uniform4fv(main.at("uP"), mat.p ?? ZERO);
    gl.uniform4fv(main.at("uQ"), mat.q ?? ZERO);
    gl.uniform4fv(main.at("uR"), mat.r ?? ZERO);
    gl.uniform4fv(main.at("uS"), mat.s ?? ZERO);
    gl.uniform1f(main.at("uAlpha"), mat.alpha ?? 1);
    gl.uniform1f(main.at("uGhost"), mat.ghost ?? 0);
    const faces = mat.faces ?? "outside";
    if (faces === "both") gl.disable(gl.CULL_FACE);
    else {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(faces === "inside" ? gl.FRONT : gl.BACK);
    }
    gl.drawElements(gl.TRIANGLES, held.count, gl.UNSIGNED_INT, 0);
  };

  // Solid things first; edges cut in a material are softened by coverage.
  gl.uniform1i(main.at("uCoverage"), 1);
  gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  for (const item of frame.items) if (solid(item)) draw(item);
  gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);

  // Then whatever is seen through, farthest first.
  const [ex, ey, ez] = frame.eye;
  const away = (item: Item) =>
    (item.at[12] - ex) ** 2 + (item.at[13] - ey) ** 2 + (item.at[14] - ez) ** 2;
  const clear = frame.items.filter((item) => !solid(item));
  if (clear.length) {
    clear.sort((a, b) => away(b) - away(a));
    gl.uniform1i(main.at("uCoverage"), 0);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    );
    gl.depthMask(false);
    for (const item of clear) draw(item);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
  gl.disable(gl.SCISSOR_TEST);
  gl.bindVertexArray(null);
  tidy(st);
  return canvas;
}
