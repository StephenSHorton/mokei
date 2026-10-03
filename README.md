# Yardline

A small playable web prototype of a clay-diorama warehouse yard. It is a look-alike of the isometric “manage the warehouse like a strategy game” promo aesthetic — rebuilt from primitives, not from original assets.

Click a forklift, truck, or the building. The camera eases to follow the selected unit. Forklifts shuttle pallets; trucks loop in, back into dock bays, wait, and leave.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## GitHub Pages

Live site: [https://stephenshorton.github.io/yardline/](https://stephenshorton.github.io/yardline/)

Pushes to `main` build with `npm ci && npm run build` and deploy `dist/` via GitHub Actions. Vite uses `base: './'`, so JS, CSS, and the favicon stay relative and load under the `/yardline/` subpath. Fonts come from Google Fonts. Models are built in the client from primitives, so there are no extra asset files to resolve.

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

Vite + React + TypeScript, react-three-fiber, drei, N8AO + SMAA, Tailwind, leva, zustand, lucide-react. Models are rounded boxes, filleted lathe cylinders and beveled extrusions — no hard edges, one matte (Lambert) color per part.
