# Version B: scene direction

Version B is the same comparison at `/b` with a second set of chapter
animations. Version A (`/`, and the offline `index.html`) is unchanged. B is
switched on by `version="b"` on `FleetExperience`; its scenes live in
`src/lib/scenes/b/` and are registered in `chapterScenesB`. Only the
animations differ: the page, its figures and its copy are A's.

## Why it exists

Feedback on the A scenes: they moved a lot and said little, and the car was
a diagram of a car. B starts again from nothing.

- **A real model, to scale.** Everything is in metres. The car is built from
  its real length, width, height, wheelbase and wheel size; a person is
  1.74 m; a boot block is 100 litres.
- **A scene states figures.** Every scene is drawn from the two selected cars
  (`SceneSpec.cars`) and its labels quote them. Change the selection and the
  scene changes.
- **One idea per beat, one thing moving.** Three beats of five to six
  seconds. The camera creeps a few per cent and moves only between beats.
- **No stand-ins.** Where a person matters there is a person. Nothing floats
  except a label, or an icon badge on a hairline stem.

## How it is drawn

A small WebGL2 renderer (`gl.ts`) lights a white model the way a studio
would: one soft sun with a shadow map, a pale sky from every side, and
ambient shade worked out from a height map taken from straight above, so
things sit on the floor. One context is shared by every scene on the page;
each frame is drawn there and copied to the scene's own 2D canvas, and the
labels are drawn over it in 2D (`overlay.ts`).

Where WebGL2 is not available the same frame is painted flat on the 2D
canvas (`flat.ts`): coarser and without shadows, but the scene and its
labels still read. The unit tests run this path.

| File         | What it holds                                                  |
| ------------ | -------------------------------------------------------------- |
| `math.ts`    | Easing, vectors, matrices, the curve the car's profiles follow |
| `mesh.ts`    | Softened boxes, turned profiles, tubes, lumpy spheres          |
| `gl.ts`      | The renderer and its materials                                 |
| `car.ts`     | The car: body, wheels, mirrors, seats, battery, screen         |
| `world.ts`   | Floor, road, houses, trees, chargers, people, floor markings   |
| `overlay.ts` | Pills, badges, flow lines, measures                            |
| `stage.ts`   | Camera, light, and the loop that turns a moment into a frame   |

## The car

The body is a skin lofted through cross-sections along its length
(`CarShape` in `car.ts`): heights along the centreline, the waist's
half-width, the shoulder, and the roof rail, each a curve through measured
stations. Glass, lamps, trim, wheel arches, shut lines and door handles are
laid on by the material from those same stations, so they stay crisp at any
size. The tailgate is the same mesh drawn twice, once without it and once
alone, turned about its hinge.

Two shapes: `FASTBACK` is the car the page is about, in gloss black.
`SQUAREBACK` is a plainer, upright SUV in white clay that stands in for
whichever alternative is selected. It is not a drawing of any one of them.
No badge, wordmark or manufacturer interface is drawn on either.

## Look

A white architect's model on a pale floor: soft shadows, warm glazing, white
trees. Each chapter has one accent. Labels are round-ended pills in the
page's own type: dark for the baseline, white for the alternative; a green
dot means the car has the feature, a hollow one that it does not.

## Scenes

| Chapter              | Beats                                                         | What is to scale                                          |
| -------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| 01 Price & ownership | Listed price · Drive-away · Warranty                          | A slab per A$10,000 under each car; a tick per year       |
| 02 Automated driving | Stop sign · Roundabout · Unprotected turn (one 10-second run) | The streets; what the cameras cover and pick out          |
| 03 Range & charging  | Plug in · Charge · Range                                      | Charging bars race at each car's pace; ring radius per km |
| 04 Space & safety    | Seats · Boot · Safety rating                                  | Seat count; 100-litre blocks; a star per ANCAP star       |
| 05 Daily convenience | Phone key · Unlocks as you arrive · Locks as you leave        | The walk, and the reach of the key                        |
| 06 Comfort & drive   | Heated seats · Ventilated seats · 0–100 km/h                  | Which seats; both cars' runs in their claimed times       |
| 07 Software & tech   | Updates over the air · Phone app · Phone mirroring            | Nothing; what each update can reach                       |

## Checking a frame

The canvas listens for a `scene-seek` event carrying seconds, so a test or a
screenshot can hold any scene at a moment:

```js
canvas.dispatchEvent(new CustomEvent("scene-seek", { detail: 8 }));
```

A hidden browser tab does not lay out or composite, so the canvases stay
blank there; check in a visible tab or with Playwright.
