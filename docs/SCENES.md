# Authoring a Mokei scene

A **scene** is a clay diorama: a `World` (R3F tree), the **theme** it wants, camera defaults, optional HUD, and optional **event hooks** so a host app can drive the toys.

A **theme** is only tokens (`data-theme` on `<html>`). Scenes may share a theme or bring their own. Worlds are **opt-in** — importing `mokei` or `mokei/scene` does not load Yardline.

## Contract

```ts
import { applyTheme, registerScene, activateScene, type SceneDefinition, type SceneEvent } from 'mokei'
import 'mokei/theme/preset.css'
// Only if you want the warehouse:
// import 'mokei/scene/yardline'

registerScene(hostScene)
const scene = activateScene('quarry') // or getScene('quarry')
// <Canvas><scene.World /></Canvas>
// {scene?.Hud ? <scene.Hud /> : null}
scene?.dispatch?.({ type: 'task-started', id: 'agent', label: 'Does this comment match the test?' })
```

`getScene` / `getTheme` return `undefined` for unknown ids and `console.warn`. They never throw. `activateScene` / `resolveScene` fall back to the default registered scene when they can.

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

`SOFT_EDGE_SCALE` is `0.8`. Do not change it for new art; call `scaleSoft()` so every scene stays on the same toy edge.

## SceneEvent

Keep the original five. Add Rock-session events so a host can delete its shims.

| Mokei `type` | Payload | Rock compat / sim |
| --- | --- | --- |
| `task-started` | `{ id?, label? }` | same — agent / job began |
| `task-progress` | `{ id?, progress }` | same — 0..1 |
| `task-finished` | `{ id? }` | same |
| `select` | `{ id }` | same — `null` clears |
| `reset` | — | same |
| `tool-station` | `{ id?, station?, label? }` | `StationId` (`read` / `edit` / `bash` / `tool` / `gate` / `dock` / `drill`) |
| `permission-gate` | `{ id?, allowed?, label? }` | phase `gate` / `ask` |
| `crate` | `{ id?, count?, label? }` | phase `crates` / crate count on the dock |
| `output` | `{ id?, label? }` | dock / stdout |
| `subagent-spawn` | `{ id?, label? }` | phase `subagent` / `spawn_subagent` |
| `subagent-finish` | `{ id? }` | explore cart done |

## Add a scene (checklist)

1. **Theme** — reuse `yardline`, `blank`, or `quarry`, or add `html[data-theme='your-id']` in `src/kit/theme/tokens.css` and `registerTheme`. Host apps can also `registerTheme` without a kit PR.
2. **Folder** — host-side (`site/src/quarry/` in Rock) or `src/scenes/your/` here. Do **not** put quarry art inside this repo.
3. **World** — compose shared clay (`ClayCameraRig`, `Lights`, `ClayGround`, `SoftBox`, `RoundCyl`, `PostFX`). Keep `SOFT_EDGE_SCALE` at 0.8.
4. **Events** — export `dispatch` and map `SceneEvent` onto your sim/store.
5. **Register** — `registerScene(def)` from the host, or a thin `src/kit/scene/your.ts` that calls `registerScene` on import so `import 'mokei/scene/your'` is enough.
6. **Try it** — playground `/?scene=your` (after the playground imports that module), gallery `#/ui` theme/scene switcher.

The blank scene (`src/scenes/blank/`) is the smallest working example: a clay pad, two boxes, a cylinder, and a `dispatch` that slides a block when `task-started` fires. Import `mokei/scene/blank` to register it.

## Worked sketch: quarry (lives in Rock)

Rock’s site owns the quarry World. This kit ships the **quarry theme** and the event names. Map the contract; don’t fork the kit.

| Rock / agent fact | Scene hook | Clay stand-in |
| --- | --- | --- |
| Agent starts a job | `dispatch({ type: 'task-started', id, label })` | Drill at a bench starts spinning |
| Job is N% done | `dispatch({ type: 'task-progress', id, progress })` | Ore cart inches along a rail |
| Tool call | `dispatch({ type: 'tool-station', station: 'read', label })` | Station lights up |
| Permission ask | `dispatch({ type: 'permission-gate', allowed: false })` | Gate arm down |
| Permission allow | `dispatch({ type: 'permission-gate', allowed: true })` | Gate arm up |
| Spawn explore | `dispatch({ type: 'subagent-spawn', id, label })` | Second cart on the spur |
| Explore done | `dispatch({ type: 'subagent-finish', id })` | Spur cart idles |
| Stdout / files | `dispatch({ type: 'crate', count })` / `{ type: 'output' }` | Crates on the dock |
| Job finished | `dispatch({ type: 'task-finished', id })` | Cart dumps; drill idle |
| User focuses a run | `dispatch({ type: 'select', id })` | Camera ease |
| Clear / new session | `dispatch({ type: 'reset' })` | Home framing |

Host wiring (Rock):

```ts
import { activateScene, registerScene } from 'mokei'
import { quarryScene } from './quarry/scene'

registerScene(quarryScene)
activateScene('quarry')

onAgentEvent((job) => {
  if (job.phase === 'start') quarryScene.dispatch?.({ type: 'task-started', id: job.id, label: job.title })
  if (job.phase === 'read') quarryScene.dispatch?.({ type: 'tool-station', station: 'read', id: job.id })
  if (job.phase === 'gate') quarryScene.dispatch?.({ type: 'permission-gate', allowed: false, label: job.title })
  if (job.phase === 'subagent') quarryScene.dispatch?.({ type: 'subagent-spawn', id: job.id, label: job.title })
  if (job.phase === 'crates') quarryScene.dispatch?.({ type: 'crate', count: job.crates })
  if (job.phase === 'done') quarryScene.dispatch?.({ type: 'task-finished', id: job.id })
})
```

## Playground

| URL | Scene |
| --- | --- |
| `/` or `/?scene=yardline` | Warehouse. HUD + sim. `?freeze=8&noao` for chrome diffs |
| `/?scene=blank` | Starter pad |
| `#/ui` | Gallery; theme (including Quarry) + scene switcher and a live World preview |
