# Mokei principles

## White is the primary material

Most of a Mokei world is white or near-white. Color is a privilege. A theme may name **at most three accents**. Everything else is the **base**, a **detail ramp** (dark / mid / light), or a **muted ground**.

This is a core kit rule, not a quarry-only preference. Yardline already works this way: white walls, blue as the defining accent, yellow as a signal, dark tires. New scenes — including Rock’s quarry — follow the same discipline.

## Material roles

Clay primitives take a role, not a free hex:

| Role | Job |
| --- | --- |
| `base` | White / near-white. Primary material on most surfaces. |
| `accent1` | Defining features, links, brand, UI primary. |
| `accent2` | Optional. Permission, warning, and active states. |
| `accent3` | Optional. Secondary trim. |
| `detail.dark` / `detail.mid` / `detail.light` | Near-black ramp for tires, hubs, ironwork. |
| `ground` | Muted pad / rock / soil. Not an accent and not a UI fill. |

```tsx
<SoftBox material="base" />
<SoftBox material="accent1" />
<SoftBox material="detail.dark" />
```

`applyTheme` writes the palette onto `--mokei-*` CSS variables and the materials store. `assertMaterialPalette` warns in dev when `base` is not near-white (luminance &lt; 0.85) or when more than three accents are declared.

## Do

- Paint walls, carts, cabinets, roofs, cabs, and most boxes `base`.
- Spend `accent1` on trim, edges, doors, and the one thing the eye should find first (Yardline roofs/racks, quarry azurite drills and links). A whole roof or annex is not an accent.
- Keep `accent2` for signals. On quarry that is **signal yellow** — a lamp or stripe, never a full cab or body, and never ink on white.
- Keep `accent3` and `detail.*` on small parts: bumpers, stripes, wheels, windows, ironwork.
- Derive `detail.mid` and `detail.light` from the dark end (`deriveDetailRamp`).
- Put sandstone, dirt, and rock faces on `ground`.

## Don’t

- Invent a fourth accent because a mesh “needs a bit of color.”
- Use a saturated fill as the page or HUD background. UI surfaces stay on `base`.
- Use signal yellow (`accent2` on quarry) as text on white. Tokens pair it with a dark foreground (`--warning-foreground: #1C1F24`).
- Drench a whole object in an accent or detail colour. Under quarry (`whiteFills`), large fills remap to `base` so Yardline’s authored roof/cab roles do not become slate blocks.
- Paint the whole diorama in ground/sandstone. Ground is the floor, not the brand.
- Reach for `unsafeColor` to sneak in orange, teal, or a new hero hue.

## `unsafeColor`

One-off leftovers (a driver’s hard hat, a teal traffic truck, a mint charger lamp) may pass `unsafeColor="#…"`. It is an escape hatch. Prefer a role. The deprecated `color` prop on SoftBox / RoundCyl / Matte maps to the same hatch.

## Yardline (zero-change mapping)

| Old look field | Role | Hex |
| --- | --- | --- |
| `wall` | `base` | `#f7f9fd` |
| `accent` | `accent1` | `#2563eb` |
| `yellow` | `accent2` | `#f2c14e` |
| `roof` | `accent3` | `#2f63e6` |
| `tire` | `detail.dark` | `#1f2533` |
| `ground` | `ground` | `#e9eef8` |

## Quarry (Rock-locked)

Orange and teal are gone.

| Role | Name | Hex | Use |
| --- | --- | --- | --- |
| `base` | warm white | `#F7F5F0` | UI surfaces, carts, walls, roofs, cabs |
| `accent1` | azurite | `#2B59E8` | Features, links, brand, `--primary` |
| `accent2` | signal yellow | `#F2B705` | Permission / warning / active only |
| `accent3` | slate | `#3B4552` | Secondary trim |
| `detail.dark` | near-black | `#1C1F24` | Dark end of the ramp; mid/light are mixed toward base |
| `ground` | sandstone | `#E6D5B8` | Ground and rock faces only |

`--warning` is the yellow surface; `--warning-foreground` is near-black so yellow is never the text color on white.

See [SCENES.md](./SCENES.md) to plug a quarry World into this theme.
