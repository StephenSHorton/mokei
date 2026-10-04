# Mokei architecture

Mokei is the design system. **Yardline** is the first theme + scene (playground at `/`). **Blank diorama** is the second scene, proof that another world can register without touching the warehouse.

## Layout

```
src/kit/
  theme/          token sets (yardline, blank, …)
  scene/          registry + Scene contract + activateScene
  clay/           SoftBox, RoundCyl, SOFT_EDGE_SCALE, Matte, look, Lights, PostFX, ClayGround, ClayCameraRig
src/scenes/
  yardline/       warehouse World, models, sim, HUD
  blank/          starter pad
```

```ts
import { activateScene, getScene } from 'mokei'

activateScene('yardline')
const scene = getScene('yardline')
// <Canvas><scene.World /></Canvas>
// {scene.Hud ? <scene.Hud /> : null}
scene.dispatch?.({ type: 'task-started', id: 'fl-10' })
```

See [SCENES.md](./SCENES.md) to author a quarry (or any) scene.

## Playground

`App` reads `?scene=` (default `yardline`), calls `activateScene`, and mounts `scene.World` plus optional `scene.Hud`. `/` with no query is the measured Yardline HUD + yard — do not change its look.

`SOFT_EDGE_SCALE` stays `0.8`.

## shadcn

- `components.json` — Vite + Tailwind v4, style `base-nova`, Base UI.
- HUD variants live on the kit components; playground chrome is composed in `src/scenes/yardline/hud`.

## shadcn registry (Pages)

`registry.json` → `npm run build:registry` → `public/r/*.json`. Theme + UI items as before. `scene` is a `registry:lib` copy of the contract types; the runnable worlds ship through the git package.

## Git dependency

`package.json` `exports` point at `src/kit` and the scene packages. No `prepare` script.

```ts
import { SoftBox, SOFT_EDGE_SCALE } from 'mokei/clay'
import { getScene } from 'mokei/scene'
import { yardlineScene } from 'mokei/scene/yardline'
import { blankScene } from 'mokei/scene/blank'
```

## Routes

| URL | What |
| --- | --- |
| `/` or `/?scene=yardline` | Yardline playground |
| `/?scene=blank` | Starter diorama |
| `?freeze` / `?freeze=8` | Pause the yard sim (default 8s), pin clock `09:41` |
| `#/ui` | Component showcase + theme/scene switcher |
