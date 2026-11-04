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
| `home.ts`    | The house and drive several scenes are set at                  |
| `town.ts`    | The repeating street, roundabout and lay-by                    |
| `props.ts`   | Luggage, coins, chargers, a café, storage spaces, night light  |

## The car

The body is a skin lofted through cross-sections along its length
(`CarShape` in `car.ts`): heights along the centreline, the waist's
half-width, the shoulder, and the roof rail, each a curve through measured
stations. Glass, lamps, trim, wheel arches, shut lines and door handles are
laid on by the material from those same stations, so they stay crisp at any
size. The tailgate is the same mesh drawn twice, once without it and once
alone, turned about its hinge; the bonnet opens the same way.

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

| Chapter              | Beats                                                            | What is to scale, and what is not                                  |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| 01 Price & ownership | Retail price · Charging cost · Warranty                          | A tile per A$10,000; a coin per dollar for 50 kWh; a band per year |
| 02 Automated driving | Following traffic · Supervised junction · Parking (one 10-s run) | The streets; what the cameras cover and pick out                   |
| 03 Range & charging  | Home, charged · Supercharger route · Plug in and go              | Charging bars race at each car's pace; the map is a sketch         |
| 04 Space & safety    | Front trunk · Boot · Under the floor                             | The car and the luggage; volumes are quoted, not drawn             |
| 05 Daily convenience | Approach · Load and settle · Walk away                           | The walk, and the reach of the key                                 |
| 06 Comfort & drive   | Quiet cabin · Climate before you arrive · Smooth away            | Nothing; noise and climate are shown, not measured                 |
| 07 Software & tech   | Release history · What an update brings · Overnight install      | A pin per documented release, at its date on a two-year ruler      |

These seven follow the story brief of 8 October 2026. The scenes before it
are kept in `backups/scenes-b-2026-10-08/`, with the built page.

### What the brief asks every scene to keep to

- **01** quotes the listed retail price and says it is before on-road
  costs. The charging beat is 50 kWh at home off-peak (4–8c per kWh, so
  A$2–4) against an example 50c per kWh at a Supercharger (A$25), and its
  small print says plans, eligibility and site prices vary.
- **02** keeps a line of small print up for the whole run saying the driver
  supervises, and each label says whether the help is standard equipment or
  a paid option.
- **03** calls the network "an extensive, integrated fast-charging network"
  and nothing stronger. The map, route and sites are a sketch and say so.
- **04** shows the well under the boot floor for the Model Y only, without a
  figure, and says some alternatives have one too.
- **06** has no measured cabin-noise figure for any car, and says so. The
  acoustic glass is the maker's description.
- **07** counts documented release families as minimums over the research
  window, never as installations. Phone mirroring is not in this scene.

### Places

Three places are shared, so the chapters read as one town: a house and its
drive (`home.ts`: chapters 03, 04, 05 and 07), a street with a roundabout
and a lay-by that repeats block after block (`town.ts`: 02 and 06), and a
forecourt (01). Smaller things are in `props.ts`: luggage, coins, a home
charger, a charging site and café, the car's three storage spaces, and the
night light used for charging and installing overnight.

## Checking a frame

The canvas listens for a `scene-seek` event carrying seconds, so a test or a
screenshot can hold any scene at a moment:

```js
canvas.dispatchEvent(new CustomEvent("scene-seek", { detail: 8 }));
```

A hidden browser tab does not lay out or composite, so the canvases stay
blank there; check in a visible tab or with Playwright.

## Keeping motion smooth

- A label is painted once on a small canvas of its own and laid down where
  it falls (`pill` in `overlay.ts`). Browsers set canvas text on whole
  pixels, so words drawn straight on the plate hop inside a label that is
  drifting with the camera.
- Camera keys run through `track`, which passes smoothly through every key
  and stops at one only if the value rests there.
- Cars are driven, not keyframed. A `route` (`town.ts`) is smoothed so its
  bends come on and go off gradually, and a `timetable` works out the speed
  along it from how tight each bend is and how hard a calm driver gains
  speed or brakes. A test holds the hero car to that.
- A car on a `route` turns continuously between the route's samples, and
  walkers pick up and lose their pace (`paced`) and turn into and out of a
  walk (`faced`) over a few steps.
- Nothing is removed while it can be seen: props flatten into the floor and
  take its colour, and the car's lining is drawn under its glass shell so the
  change to and from glass has no step in it.
