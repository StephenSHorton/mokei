# Mokei architecture

Mokei is the design system. Yardline is the first **theme + scene** that happens to also be the playground at `/`.

Nothing in the kit is warehouse-specific except the first registered implementations.

## Two registries

```
src/kit/
  theme/          UI token sets
    tokens.css    raw CSS variables (HUD + clay, mapped to shadcn)
    preset.css    playground Tailwind v4 @theme (HUD-safe base layer)
    mokei.css     consumer preset (git export + registry)
    yardline.ts   first theme
    registry.ts
  scene/          3D worlds
    yardline.ts   registers src/scene/World
    registry.ts
```

A **theme** is a token set applied with `data-theme` on `<html>`. A **scene** is a `World` component plus the theme it wants.

```ts
import { applyTheme, getTheme } from '@/kit/theme'
import { getScene } from '@/kit/scene'

applyTheme('yardline')
const scene = getScene('yardline')
// <scene.World />
```

The playground HUD still uses the original measured CSS in `src/index.css`. Those rules now read the shared variables from `tokens.css` so the look does not change.

## Adding a quarry theme + scene

1. Add `[data-theme='quarry']` overrides in `src/kit/theme/tokens.css` (or a sibling imported from the preset). Same semantic names, different clay/glass values if Rock's site needs them.
2. Add `src/kit/theme/quarry.ts` and register it in `src/kit/theme/registry.ts`.
3. Put models + world under something like `src/scenes/quarry/` (do **not** fold them into the warehouse `src/scene` / `src/models` / `src/sim` tree).
4. Add `src/kit/scene/quarry.ts` that exports `{ id: 'quarry', themeId: 'quarry', World }` and register it.
5. A consumer selects `getScene('quarry')` and `applyTheme('quarry')`.

The warehouse yard stays the default playground. Do not rescale it; `SOFT_EDGE_SCALE` stays `0.8`.

## shadcn

- `components.json` — Vite + Tailwind v4, CSS file is the preset, style `base-nova`, Base UI primitives.
- `src/lib/utils.ts` — `cn` from the `cn` package.
- `src/components/ui/*` — generated components, then lightly themed (glass cards, HUD pill badge tones).

## shadcn registry (Pages)

`registry.json` at the repo root is the source catalog. `npm run build:registry` (`shadcn build` + URL rewrite) writes `public/r/<name>.json`. The site `build` script runs that first so GitHub Pages serves:

- `https://stephenshorton.github.io/mokei/r/registry.json`
- `https://stephenshorton.github.io/mokei/r/theme.json`
- `https://stephenshorton.github.io/mokei/r/button.json` (etc.)

Each UI item lists `@mokei/theme` as a registry dependency. The build rewrites that to an absolute `…/r/theme.json` URL so `npx shadcn add <button url>` pulls the theme without extra config. Set `MOKEI_REGISTRY_BASE` when generating JSON for a local preview host.

## Git dependency

`package.json` `exports` point at `src/kit` TypeScript and CSS. There is no `prepare` script. Playground-only packages (Vite, leva, Base UI, lucide, shadcn CLI) are `devDependencies` so `npm install github:StephenSHorton/mokei` does not install or build the Yardline app. Scene runtime bits that consumers should not have to think about (`zustand`, postprocessing) stay in `dependencies`. React / three / r3f / drei / Tailwind are `peerDependencies`.

## Routes

| URL | What |
| --- | --- |
| `/` or `#/` | Yardline playground (unchanged HUD + 3D) |
| `#/ui` | Component showcase in the Mokei theme |
