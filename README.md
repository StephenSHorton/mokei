# Mokei

Stephen's design system and aesthetic playground. The visual language is **glass panels on a clay diorama** — first realized as the Yardline warehouse-yard prototype.

The package is `mokei` (the repo). It is **not** published to npm. Other apps install the kit as a git dependency or pull UI pieces from the Pages shadcn registry. License: MIT.

**White is the primary material.** A theme may name at most three accents. Read [docs/PRINCIPLES.md](docs/PRINCIPLES.md).

## Yardline playground

The root of the site is still the playable clay-diorama warehouse yard. The in-app product name is **Yardline**. Click a forklift, truck, or the building. The camera eases to follow the selected unit. Forklifts shuttle pallets; trucks loop in, back into dock bays, wait, and leave.

The HUD look is intentional and should stay put. The playground HUD is composed from the registry components (button, card, badge, tabs, and the rest) with HUD-sized variants.

## UI showcase

Component gallery (same theme, no 3D):

- Local: [http://127.0.0.1:43123/#/ui](http://127.0.0.1:43123/#/ui)
- Pages: [https://stephenshorton.github.io/mokei/#/ui](https://stephenshorton.github.io/mokei/#/ui)

## Use in another project

### shadcn registry (components + theme)

Catalog: [https://stephenshorton.github.io/mokei/r/registry.json](https://stephenshorton.github.io/mokei/r/registry.json)

```bash
# one-off URL (button also installs the Mokei theme)
npx shadcn@latest add https://stephenshorton.github.io/mokei/r/button.json

# or register the namespace once
npx shadcn@latest registry add @mokei=https://stephenshorton.github.io/mokei/r/{name}.json
npx shadcn@latest add @mokei/theme @mokei/card
```

Items: `theme`, `button`, `card`, `badge`, `input`, `tabs`, `tooltip`, `progress`, `separator`, `avatar`, `kbd`, `label`, `dropdown-menu`, `stepper`. After adding `theme`, import the copied preset. `npx shadcn add` merges new CSS variables but does not overwrite nova `:root` keys, so call `applyTheme('yardline')` (or set `data-theme="yardline"` on `<html>`) — those selectors beat the host `:root`.

```css
@import "tailwindcss";
@import "./mokei/preset.css";
@import "./mokei/tokens.css";
```

The consumer project needs a Vite + Tailwind v4 + shadcn (`base-nova` / Base UI) setup first (`npx shadcn@latest init`).

### Git dependency (theme + scene kit)

Committed `pkg/` (ESM + `.d.ts` + CSS). No `prepare` script — installing from git does not build the playground and does not need TypeScript.

```bash
npm install github:StephenSHorton/mokei
```

Peer deps (you provide): `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`. `tailwindcss` is optional (only if you import the CSS).

Scenes are opt-in. `mokei` and `mokei/scene` do not import Yardline.

```ts
import { activateScene, registerScene, getScene, setDefaultSceneId } from 'mokei'
import { SoftBox, SOFT_EDGE_SCALE } from 'mokei/clay'
import type { SceneEvent } from 'mokei/scene'
import 'mokei/theme/preset.css'
import 'mokei/themes/quarry.css'
import { quarryTheme } from 'mokei/theme/quarry'
// import 'mokei/scene/yardline' // only if you want the warehouse

setDefaultSceneId(hostScene.id)
registerScene(hostScene)
const scene = getScene('quarry') // undefined + warn if not registered
activateScene(hostScene)
scene?.dispatch?.({ type: 'tool-station', station: 'read' })
```

Clay takes `material="accent1"` (or `detail.dark`, `base`, …). `unsafeColor` is the discouraged hex hatch.

Other exports: `mokei/theme`, `mokei/theme/<id>`, `mokei/theme/tokens.css`, `mokei/theme/preset.css`, `mokei/themes/<id>.css`, `mokei/scene`, `mokei/scene/yardline`, `mokei/scene/blank`, `mokei/clay`. Themes: `yardline`, `blank`, `quarry`. The kit does not default to Yardline — call `setDefaultSceneId` / `setDefaultThemeId` or the first registered entry is used.

Playground: `/?scene=yardline` (default) and `/?scene=blank`. Author a new diorama with [docs/SCENES.md](docs/SCENES.md).

Prebundle drei/three so `stats.js` (a CJS drei dependency) interops:

```ts
// vite.config.ts
optimizeDeps: {
  include: ['stats.js', 'three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
}
```

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## GitHub Pages

Live site: [https://stephenshorton.github.io/mokei/](https://stephenshorton.github.io/mokei/)

Pushes to `main` build with `npm ci && npm run build` and deploy `dist/` via GitHub Actions. Vite uses `base: './'`, so JS, CSS, and the favicon stay relative and load under the `/mokei/` subpath. Hash routes (`#/ui`) work on that subpath. Fonts come from Google Fonts. Models are built in the client from primitives, so there are no extra asset files to resolve.

In the repo settings, set Pages source to **GitHub Actions** if it is not already.

## Static deploy

```bash
npm run build
```

`dist/` is a static site (`base: './'`), so it can be dropped on any host — including a project Pages URL.

```bash
npm run preview
```

serves that build on the same port.

## What to tune

The **Look** panel is hidden so it stays out of the composition. Press **L** to toggle it, or open the page with `?look`. The knobs that change the clay look the most:

1. **AO strength / AO radius**: N8AO in world units (radius about 1.5–3). Strength controls how dark the clay contact gets.
2. **Sun angle / sun height / sun softness**: a gentle key from the front-left. Softness is the PCF shadow blur radius.
3. **Sky color / sky intensity**: the cool hemisphere light does most of the lighting. Light values are in albedo units, so sky plus sun near 1.0 keeps white surfaces white.
4. **Zoom / angle around / angle down**: a locked orthographic view (about 36° around and 37° down). Zoom is defined for a 1728 px wide window and scales with the window.
5. **Palette**: lavender-tinted ground (`#E9EEF8`), periwinkle road, white corrugated walls, blue roofs, safety yellow, tan cardboard, mint trees.

There is no bloom, grain, outline, or vignette on purpose.

## Controls

- Click a unit or the warehouse to select it. You can also pick a row in the Docks / Forklifts / Trucks board.
- Drag the yard to pan. Zoom with the scroll wheel or `+` / `−`, rotate with the arrows, and reset with Home.
- The dashed floor path is the selected unit's remaining route. The 3D corner brackets mark the selection.

## HUD

The HUD is laid out at the 1728×995 reference size of the promo frames and scales down to fit smaller windows. It uses SF Pro on Apple platforms, matching the promo, and falls back to Inter elsewhere, set slightly smaller and tighter to match SF's widths. Icons are lucide-react.

## Stack

Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui (Base UI / nova), react-three-fiber, drei, N8AO + SMAA, leva, zustand, lucide-react. Models are rounded boxes, filleted lathe cylinders and beveled extrusions — no hard edges, one matte (Lambert) color per part. `SOFT_EDGE_SCALE` is `0.8`.

## Architecture

See [docs/PRINCIPLES.md](docs/PRINCIPLES.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/SCENES.md](docs/SCENES.md) for the white-dominant rule, the scene contract, and how a quarry (drills, carts, conveyors) would plug in.
