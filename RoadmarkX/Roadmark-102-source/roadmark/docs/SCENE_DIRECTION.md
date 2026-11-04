# Chapter scenes: art direction

Working brief for the seven animated chapter scenes. The earlier night-only,
three-second scenes are the reference for subject matter, not for look or
timing.

## What was wrong with the first pass

- Seven scenes, one look: every panel was the same navy night.
- Ideas were carried by floating icons (tag, padlock, shield, battery) instead
  of by staging. The camera never moved.
- One second per beat is too fast to read.
- The car read as a generic dark saloon, not a Model Y.
- People were three strokes and a dot: no arms, clothes, or walk.

## Direction: modernist axonometric

The page is already Swiss: Helvetica, a strict grid, flat colour tiles. The
scenes should look like plates from the same book.

- **Axonometric, not perspective.** The isometric drawing is the modernist
  architect's projection. Keep it, and build everything as true solids in it.
- **Flat planes, no outlines.** Form comes from three tones per object (top,
  lit side, shaded side) and one hard cast shadow. No gradients on solids.
- **Paper and ink.** Day scenes sit on the page's own paper (`#f5f5f0`) so the
  plate has no frame. Ink is the page ink (`#172326`).
- **One accent per chapter.** Each scene's idea is drawn in its chapter colour
  (the letter tile beside it). Signal red and yellow are reserved for brake
  lamps, stop signs and warnings.
- **Geometry carries meaning.** Concentric rings for reach and time, a straight
  rule for level, a filled bar for charge. No words, numbers or brand marks in
  the drawing.
- **Architecture.** White volumes, flat roofs, ribbon windows, pilotis and a
  few colour panels. Trees are spheres on stems, as in an architect's model.

## Day and night

| Chapter | Scene | Light | Why |
| --- | --- | --- | --- |
| 01 Price & ownership | Showroom forecourt | Day | A clean plate to open on |
| 02 Automated driving | City drive | Night | Perception reads as light |
| 03 Range & charging | Charging stop, then the map | Day | Rings on paper |
| 04 Space & safety | Driveway, family loading | Day | People and colour |
| 05 Daily convenience | Leaving the house | Morning | A daily routine |
| 06 Comfort & drive | Night road | Night | Cool and warm read as light |
| 07 Software & tech | Driveway overnight | Night into dawn | The car changes while it sleeps |

One lighting value runs from night (0) to day (1); every material is mixed
from a night and a day colour, and glow fades as daylight rises. That is what
lets chapter 07 pass through dawn.

## Zoom and focus

The camera is the main storytelling tool. Each scene is three shots joined by
eased moves, never cuts mid-idea:

1. **Establish** wide enough to place the car.
2. **Push in** on the one detail the beat is about (port, seat, handle,
   wheel), while everything else is washed back towards the ground colour.
3. **Pull out** past the starting frame to show the consequence (the map, the
   year, the street).

Zoom is exponential so a move feels the same speed throughout. Focus is tonal,
not blur: a wash of the ground colour over the set, with the subject drawn on
top at full contrast, plus an X-ray pass on the car when the idea is inside it
(battery, seats, suspension).

Loops close on a camera move back to the first frame. Where the world has to
reset (bags unloaded, car returned), an iris wipe in the chapter colour hands
the end of the loop to its start.

Refinements to how the camera is used:

- **Go in when the idea is inside the car.** Cool and warm seats, the seat
  count and the safety shield each get their own push-in, not one wide hold.
- **Follow the actor.** Where a phone stands for its owner, the camera walks
  with it, then goes close as it reaches for the car and pulls back along the
  link to show the car answer. The phone is drawn half as big again so it
  carries.
- **Holds creep.** A hold of more than a second and a half eases a few per
  cent closer (or wider, over the range map) so the frame never goes dead.
- **Wash back what competes.** While the battery fills, the charging bay
  fades to the ground colour so the charge is the only green in frame.
- **Frame below the table.** The page lays a table of figures over the top of
  each panel. The panel measures it and tells the kit (`setCovered`), and
  every scene sets its subject lower by three-tenths of what is covered, so
  shields, waveforms and close-ups sit between the table and the labels.
- **Sound is drawn across the panel.** The voice waveform is laid out
  left-to-right on screen whichever way the car points, about a centre line.

## Timing

Beats run about three seconds each, so loops are nine to ten seconds. Moves
ease in and out; nothing travels at constant speed. Each beat has one primary
action, a short hold, and at most one secondary motion.

## The car

One code-built model of the 2025 Model Y, lofted from cross-sections in
millimetres: 4,790 long, 1,920 wide, 1,624 high, 2,890 wheelbase, 870 front
overhang. It carries the things that make the car recognisable from above: the
short bonnet running into a steep windscreen, the roof peaking over the front
seats, the fastback and ducktail, the full-width light bar at each end, the
black glass roof with body-colour rails, flush handles, black arch trims and
the five-blade aero wheels. Right-hand drive. No badge, wordmark or
manufacturer media; public photographs were used as reference only.

## People

People appear only where the car needs someone to notice: the pedestrians in
the driving scene. They are plain pictograms (`drawToken`): a round head over
one tapering body in a single colour, with a gentle bob for walking and no
limbs to animate. The driver in that scene stays seated in the car, as the
supervision cue.

Every other scene is about the car and shows nobody. Where an owner is
implied, a phone hanging at hand height stands for them (`handset` in
`props.ts`); bags load themselves and the charging plug crosses on its own.
The jointed figures and the dog remain in `figure.ts` but are no longer used.

## Rules that stay

- "Conceptual illustration" label on every panel.
- Runs only on screen; starts on a resting frame for reduced motion; pause
  button for everyone.
- Left-hand traffic and Australian road rules in the driving scene; hands on
  the wheel.
- No price, figure, rating, interface or trim detail is drawn.

## Where it lives

| File | What it holds |
| --- | --- |
| `src/lib/chapter-scenes.ts` | Which scene opens which chapter |
| `src/lib/scenes/kit.ts` | Projection, camera, light, solids, shadows, focus, iris |
| `src/lib/scenes/model-y.ts` | The car |
| `src/lib/scenes/figure.ts` | People and the dog |
| `src/lib/scenes/props.ts` | Buildings, trees, lamps, traffic, signs |
| `src/lib/scenes/*.ts` | One file per scene |
| `src/lib/driving-sim.ts` | Choreography of the city drive |
| `src/components/scene-canvas.tsx` | The panel: canvas, labels, pause button, frame pacing |

Each scene exports its beat labels, loop length, resting frame and a `draw`
function that paints one frame and reports the beat, its progress and whether
the panel is currently light or dark. Loop lengths are whole eighths of a
second so a frame at `t` and at `t + loop` are identical; `tests/scenes.test.ts`
checks that, and that every frame's geometry is finite.

On a device that takes more than about 12 ms to draw a frame, the panel draws
every other frame instead: an even half rate looks steadier than frames
dropped at random. It returns to full rate once frames take under 7 ms.
