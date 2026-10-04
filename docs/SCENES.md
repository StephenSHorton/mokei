# Authoring a Mokei scene

A **scene** is a clay diorama: a `World` (R3F tree), the **theme** it wants, camera defaults, optional HUD, and optional **event hooks** so a host app can drive the toys.

A **theme** is only tokens (`data-theme` on `<html>`). Scenes may share a theme or bring their own.

## Contract

```ts
import { applyTheme, getScene, activateScene, type SceneDefinition, type SceneEvent } from 'mokei'
import 'mokei/theme/preset.css'

const scene = getScene('yardline')
activateScene(scene)
// <Canvas><scene.World /></Canvas>
// {scene.Hud ? <scene.Hud /> : null}
scene.dispatch?.({ type: 'task-started', id: 'fl-10', label: 'Collect staged pallet' })
```

`SceneDefinition` fields:

| Field | Required | Role |
| --- | --- | --- |
| `id` / `name` / `description` | yes | Registry identity |
| `themeId` | yes | Passed to `applyTheme` |
| `World` | yes | R3F tree. Reuse `Lights`, `ClayCameraRig`, `ClayGround`, `SoftBox`, `RoundCyl` from `mokei/clay` |
| `Hud` | no | DOM overlay. Yardline ships one; blank does not |
| `camera` | no | `{ zoom, azimuth, elevation, target? }` written into the shared look store |
| `look` | no | Clay palette / lighting overrides (`ground`, `road`, `skyColor`, …) |
| `dispatch` | no | `(event: SceneEvent) => void` — host data → motion |

`SceneEvent`:

- `task-started` `{ id?, label? }` — an agent / job began
- `task-progress` `{ id?, progress }` — 0..1
- `task-finished` `{ id? }`
- `select` `{ id }` — pick a unit, or `null` to clear
- `reset`

`SOFT_EDGE_SCALE` is `0.8`. Do not change it for new art; call `scaleSoft()` so every scene stays on the same toy edge.

## Add a scene (checklist)

1. **Theme** — add `html[data-theme='your-id']` overrides in `src/kit/theme/tokens.css` (same semantic names). Add `src/kit/theme/your.ts` and register it in `src/kit/theme/registry.ts`.
2. **Folder** — `src/scenes/your/` with `World.tsx` and `index.ts`. Do **not** put quarry art inside `src/scenes/yardline/`.
3. **World** — compose shared clay (`ClayCameraRig`, `Lights`, `ClayGround`, `SoftBox`, `RoundCyl`, `PostFX`). Keep `SOFT_EDGE_SCALE` at 0.8.
4. **Events** — if the host will drive the diorama, export `dispatch` and map events onto your sim/store.
5. **Register** — `src/kit/scene/registry.ts` and a thin `src/kit/scene/your.ts` re-export so `mokei/scene/your` works.
6. **Try it** — playground `/?scene=your`, gallery `#/ui` scene switcher.

The blank scene (`src/scenes/blank/`) is the smallest working example: a clay pad, two boxes, a cylinder, and a `dispatch` that slides a block when `task-started` fires.

## Worked sketch: quarry (do not build yet)

Rock’s site wants agent work to show up as a mining diorama. Map the contract, don’t invent a second kit.

| Rock / agent fact | Scene hook | Clay stand-in (later art) |
| --- | --- | --- |
| Agent starts a job | `dispatch({ type: 'task-started', id, label })` | Drill at a bench starts spinning / dust puff |
| Job is N% done | `dispatch({ type: 'task-progress', id, progress })` | Ore cart inches along a rail; conveyor belt offset |
| Job finished | `dispatch({ type: 'task-finished', id })` | Cart dumps; drill returns to idle |
| User focuses a run | `dispatch({ type: 'select', id })` | Camera ease (Yardline already does this for units) |
| Clear / new session | `dispatch({ type: 'reset' })` | Home framing, idle poses |

Suggested files later (not in this slice):

```
src/scenes/quarry/
  index.ts          # quarryScene: themeId 'quarry', World, camera, dispatch
  World.tsx         # ClayCameraRig + Lights + benches + rails
  sim/quarry.ts     # units: drill, cart, conveyor (same idea as yard.ts)
  models/Drill.tsx  # SoftBox + RoundCyl, SOFT_EDGE_SCALE 0.8
  models/Cart.tsx
  models/Conveyor.tsx
```

Theme: `[data-theme='quarry']` in `tokens.css` — stone, rust, dust. Keep glass tokens unless Rock’s HUD needs a different chrome.

Host wiring (Rock):

```ts
import { activateScene, getScene } from 'mokei'

const quarry = getScene('quarry')
activateScene(quarry)

onAgentEvent((job) => {
  if (job.phase === 'start') quarry.dispatch?.({ type: 'task-started', id: job.id, label: job.title })
  if (job.phase === 'progress') quarry.dispatch?.({ type: 'task-progress', id: job.id, progress: job.pct })
  if (job.phase === 'done') quarry.dispatch?.({ type: 'task-finished', id: job.id })
})
```

Yardline is the reference mapping: `task-started` selects forklift `fl-10` (or the given id). A quarry `dispatch` should be the same shape with different toys.

## Playground

| URL | Scene |
| --- | --- |
| `/` or `/?scene=yardline` | Warehouse. HUD + sim. `?freeze=8&noao` for chrome diffs |
| `/?scene=blank` | Starter pad |
| `#/ui` | Gallery; theme + scene switcher and a live World preview |
