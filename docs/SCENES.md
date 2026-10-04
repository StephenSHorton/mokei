# Authoring a Mokei scene

A **scene** is a clay diorama: a `World` (R3F tree), the **theme** it wants, camera defaults, optional HUD, and optional **event hooks** so a host app can drive the toys.

A **theme** is tokens (`data-theme` on `<html>`) plus a **material palette** (see [PRINCIPLES.md](./PRINCIPLES.md)). Scenes may share a theme or bring their own. Worlds are **opt-in** — importing `mokei` or `mokei/scene` does not load Yardline. The kit does not hard-code a default scene or theme; call `setDefaultSceneId` / `setDefaultThemeId` or the first registered entry is used.

## Contract

```ts
import { applyTheme, registerScene, activateScene, setDefaultSceneId, type SceneDefinition, type SceneEvent } from 'mokei'
import 'mokei/theme/preset.css'
import 'mokei/themes/quarry.css'
import { quarryTheme } from 'mokei/theme/quarry'
// Only if you want the warehouse:
// import 'mokei/scene/yardline'

registerScene(hostScene)
const scene = activateScene('quarry') // or getScene('quarry')
// <SceneCanvas quality="high"><scene.World /></SceneCanvas>
// {scene?.Hud ? <scene.Hud /> : null}
scene?.dispatch?.({ type: 'task-started', id: 'agent', label: 'Does this comment match the test?' })
```

`getScene` / `getTheme` return `undefined` for unknown ids and `console.warn`. They never throw. `activateScene` / `resolveScene` fall back to the default registered scene when they can.

Mount the world on **`SceneCanvas`** (not a raw R3F `<Canvas>`). That is how every consumer — including Rock — gets the library AA defaults.

```ts
import { SceneCanvas } from 'mokei/clay'

<SceneCanvas quality="high">
  <scene.World />
</SceneCanvas>
```

`World` also accepts `quality` so a host that still uses a raw `<Canvas>` can write `<scene.World quality="high" />`. `ApplyCanvasQuality` inside the world then sets DPR and the PCF shadow map. **`antialias` is a WebGL context flag** and only applies when the host uses `SceneCanvas` (or passes `gl={{ antialias: true }}` itself).

## Quality

`quality?: 'high' | 'medium' | 'low' | 'auto'` on `SceneCanvas` and `World`. Default **`high`**.

| | high (default) | medium | low |
| --- | --- | --- | --- |
| Canvas | `gl.antialias: true`, `dpr={[1, 2]}` | `dpr={[1, 1.5]}` | `dpr={1}` |
| Composer (when `PostFX` / N8AO is on) | `multisampling={4}` + SMAA | `multisampling={2}` + SMAA | no MSAA, FXAA only |
| MSAA unsupported (no WebGL2) | FXAA fallback | FXAA fallback | FXAA |
| Shadows | PCF soft (Three r186: `PCFShadowMap`, the successor to `PCFSoftShadowMap`), map **2048**, bias `-0.00028` / normalBias `0.022` | map **1024** | map **1024**, slightly looser bias |
| Shadow camera | Fitted ortho frustum `±42`, near `1`, far `140` (covers the yard without wasting texels) | same frustum | same frustum |

`auto` picks a tier from `devicePixelRatio`, `navigator.hardwareConcurrency`, a `WEBGL_debug_renderer_info` GPU string (SwiftShader / Intel UHD / Mali / old Adreno → low), and a mobile UA. Playground and Rock should keep the default `high` unless they opt into `auto` or `low`.

EffectComposer replaces the canvas MSAA buffer. That is why `PostFX` sets composer `multisampling` (or FXAA when samples are unavailable). `?noao` skips the composer and keeps the canvas MSAA path.

Route / outline strokes use drei `Line` (Line2) with **screen-space** `lineWidth` (`worldUnits={false}`).

`SOFT_EDGE_SCALE` is `0.8`. Do not change it for new art; call `scaleSoft()` so every scene stays on the same toy edge.

`SceneDefinition` fields:

| Field | Required | Role |
| --- | --- | --- |
| `id` / `name` / `description` | yes | Registry identity |
| `themeId` | yes | Passed to `applyTheme` |
| `World` | yes | R3F tree (`quality?: 'high' \| 'medium' \| 'low' \| 'auto'`). Reuse `Lights`, `ClayCameraRig`, `ClayGround`, `SoftBox`, `RoundCyl`, `SceneCanvas` from `mokei/clay` |
| `Hud` | no | DOM overlay. Yardline ships one; blank does not |
| `camera` | no | `{ zoom, azimuth, elevation, target?, zoomMin?, zoomMax?, zoomReferenceWidth? }` written into the shared look store. Zoom scales with window width / `zoomReferenceWidth` (default 1728). `resetView` restores this framing. |
| `look` | no | Clay palette / lighting overrides (`ground`, `road`, `skyColor`, …) |
| `dispatch` | no | `(event: SceneEvent) => void` — host data → motion |

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

1. **Theme** — reuse `yardline`, `blank`, or `quarry` (`mokei/themes/<id>.css` + `mokei/theme/<id>`), or add `src/kit/themes/your.css` and `registerTheme` with a `materials` palette. Host apps can also `registerTheme` without a kit PR. White is the primary material; at most three accents. Quarry sets `whiteFills` so large scene surfaces stay on `base` (use `useFillRole` for roofs, cabs, annexes).
2. **Folder** — host-side (`site/src/quarry/` in Rock) or `src/scenes/your/` here. Do **not** put quarry art inside this repo.
3. **World** — compose shared clay (`ClayCameraRig`, `Lights`, `ClayGround`, `SoftBox`, `RoundCyl`, `PostFX`). Keep `SOFT_EDGE_SCALE` at 0.8.
4. **Events** — export `dispatch` and map `SceneEvent` onto your sim/store.
5. **Register** — `registerScene(def)` from the host, or a thin `src/kit/scene/your.ts` that calls `registerScene` on import so `import 'mokei/scene/your'` is enough.
6. **Try it** — playground `/?scene=your` (after the playground imports that module), gallery `#/ui` theme/scene switcher.

The blank scene (`src/scenes/blank/`) is the smallest working example: a clay pad, two boxes, a cylinder, and a `dispatch` that slides a block when `task-started` fires. Import `mokei/scene/blank` to register it.

## Worked sketch: quarry (lives in Rock)

Rock’s site owns the quarry World. This kit ships the **quarry theme** (Rock-locked palette) and the event names. Map the contract; don’t fork the kit.

| Role | Swatch | Hex | Use |
| --- | --- | --- | --- |
| `base` | warm white | `#F7F5F0` | UI + cart/wall clay |
| `accent1` | azurite | `#2B59E8` | Features, links, brand, `--primary` |
| `accent2` | signal yellow | `#F2B705` | Permission / warning / active only. Dark foreground on yellow surfaces. Never yellow text on white. |
| `accent3` | slate | `#3B4552` | Secondary trim |
| `detail.dark` | near-black | `#1C1F24` | Dark end of the detail ramp; mid/light are derived |
| `ground` | sandstone | `#E6D5B8` | Ground and rock faces only |

Orange and teal are gone. Sandstone is not a UI fill.

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
