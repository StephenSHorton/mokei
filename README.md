# Yardline

A small playable web prototype of a clay-diorama warehouse yard. It is a look-alike of the isometric “manage the warehouse like a strategy game” promo aesthetic — rebuilt from primitives, not from original assets.

Click a forklift, truck, or the building. The camera eases to follow the selected unit. Forklifts shuttle pallets; trucks loop in, back into dock bays, wait, and leave.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Static deploy

```bash
npm run build
```

`dist/` is a static site (`base: './'`), so it can be dropped on any host.

```bash
npm run preview
```

serves that build on the same port.

## What to tune

The **Look** panel (bottom-left) is the point of the prototype. The knobs that change the clay reading the most:

1. **AO strength / AO radius** — contact darkening where walls meet the apron and under vehicles. Too low and it goes flat; too high and it smudges.
2. **Sun angle / sun softness** — shadows should fall toward the lower right. Softness is the overcast, toy-set fill.
3. **Sky color / sky intensity** — cool hemisphere light. Keep it pale and slightly blue; that is the overcast key.
4. **Zoom / angle around / angle down** — locked isometric-ish view (no orbit). Defaults are 45° around and 35° down.
5. **Palette** — pale ground (`#F1F5F9`), white walls, corporate blue roof, safety yellow, tan cardboard, mint trees, slate tires.

There is no bloom, grain, outline, or vignette on purpose.

## Controls

- Click a unit or the warehouse to select it
- Drag the yard to pan; scroll or the `+` / `−` stack to zoom
- Home recenters the view
- The dashed floor path is the selected unit’s remaining route

## Stack

Vite + React + TypeScript, react-three-fiber, drei, N8AO + SMAA, ContactShadows, Tailwind, leva, zustand. Models are rounded boxes and other primitives — one matte color per part.
