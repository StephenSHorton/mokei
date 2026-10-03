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

Press **L** (or open with `?look`) to show the **Look** panel. It is hidden by default so the HUD composition matches the reference. The knobs that change the clay reading the most:

1. **AO strength / AO radius** — N8AO in world units (radius ~1.5–3). Strength is the clay contact.
2. **Sun angle / sun height / softness** — a gentle key from the front-left. Intensities are in "albedo units": sky + sun ≈ 1 keeps white surfaces white.
3. **Sky color / sky intensity** — cool hemisphere light does most of the work.
4. **Zoom / angle around / angle down** — locked orthographic view (36° around, 37° down by default). Zoom is defined for a 1728px-wide window and scales with the window.
5. **Palette** — lavender-pale lot (`#E9EEF8`), periwinkle roads, white walls, blue roof, safety yellow, tan cardboard, mint trees.

There is no bloom, grain, outline, or vignette on purpose.

## Controls

- Click a unit or the warehouse to select it, or pick a row in the docks board
- Drag the yard to pan; scroll or `+` / `−` to zoom; the rotate buttons turn the view 15°
- Home recenters the view
- The dashed floor path is the selected unit's remaining route

## UI notes

The HUD is laid out in reference pixels measured from the 1728×995 promo capture and zoomed down on smaller windows. Type is SF Pro on Apple platforms (as in the capture) and Inter elsewhere, set slightly smaller and tighter to match SF widths.

## Stack

Vite + React + TypeScript, react-three-fiber, drei, N8AO + SMAA, Tailwind, leva, zustand, lucide-react. Models are rounded boxes, filleted lathe cylinders and beveled extrusions — no hard edges, one matte (Lambert) color per part.
