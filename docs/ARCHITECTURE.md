# Mokei architecture

Mokei is the design system. **Yardline** is the first theme + scene (playground at `/`). **Blank diorama** is the second scene, proof that another world can register without touching the warehouse.

## Layout

```
src/kit/
  theme/          token sets (yardline, blank, quarry, …)
  scene/          empty registry + Scene contract + registerScene / activateScene
  clay/           SoftBox, RoundCyl, SOFT_EDGE_SCALE, Matte, look, Lights, PostFX, ClayGround, ClayCameraRig
src/scenes/
  yardline/       warehouse World, models, sim, HUD
  blank/          starter pad
```

```ts
import { activateScene, getScene } from 'mokei'
import 'mokei/scene/yardline' // opt-in; mokei/scene does not ship worlds

activateScene('yardline')
const scene = getScene('yardline')
// <SceneCanvas quality="high"><scene?.World /></SceneCanvas>
scene?.dispatch?.({ type: 'task-started', id: 'fl-10' })
```

See [PRINCIPLES.md](./PRINCIPLES.md) for the white-dominant material rule and [SCENES.md](./SCENES.md) to author a quarry (or any) scene.

Themes live in `src/kit/themes/<id>.css` plus `src/kit/theme/<id>.ts` (`materials` palette). `preset.css` is mappings only. Importing `mokei/theme` does not register Yardline.

## Playground

`App` reads `?scene=` (playground sets the default to `yardline`), calls `activateScene`, and mounts `scene.World` on `SceneCanvas` plus optional `scene.Hud`. `/` with no query is the measured Yardline HUD + yard — do not change its look (AA/quality defaults live in the kit, not the playground). The kit itself has no implicit Yardline default.

`SOFT_EDGE_SCALE` stays `0.8`.

## shadcn

- `components.json` — Vite + Tailwind v4, style `base-nova`, Base UI.
- HUD variants live on the kit components; playground chrome is composed in `src/scenes/yardline/hud`.

## shadcn registry (Pages)

`registry.json` → `npm run build:registry` → `public/r/*.json`. Theme + UI items as before. `scene` is a `registry:lib` copy of the contract types; the runnable worlds ship through the git package.

## Git dependency

Compiled kit lives in `pkg/` (ESM + `.d.ts` + CSS). `dist/` is the Vite playground and is gitignored. No `prepare` script — git install does not need TypeScript.

```ts
import { SoftBox, SOFT_EDGE_SCALE } from 'mokei/clay'
import { getScene, registerScene } from 'mokei/scene'
import type { SceneEvent } from 'mokei/scene'
import 'mokei/scene/yardline' // only if you want the warehouse
```

## Routes

| URL | What |
| --- | --- |
| `/` or `/?scene=yardline` | Yardline playground |
| `/?scene=blank` | Starter diorama |
| `?freeze` / `?freeze=8` | Pause the yard sim (default 8s), pin clock `09:41` |
| `#/ui` | Component showcase + theme/scene switcher |
