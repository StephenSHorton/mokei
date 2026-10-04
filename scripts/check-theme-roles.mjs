import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const quarryCss = readFileSync(path.join(root, 'src/kit/themes/quarry.css'), 'utf8')
const quarryTs = readFileSync(path.join(root, 'src/kit/theme/quarry.ts'), 'utf8')
const yardlineTs = readFileSync(path.join(root, 'src/kit/theme/yardline.ts'), 'utf8')
const blankTs = readFileSync(path.join(root, 'src/kit/theme/blank.ts'), 'utf8')
const materialsTs = readFileSync(path.join(root, 'src/kit/theme/materials.ts'), 'utf8')

const banned = ['#e85d04', '#2a9d8f', '#f07a2a', '#1d7a70', '#14b8a6']
const lower = `${quarryCss}\n${quarryTs}`.toLowerCase()
for (const hex of banned) {
  if (lower.includes(hex)) {
    console.error(`quarry still contains banned ${hex} (orange/teal leftover)`)
    process.exit(1)
  }
}

const required = ['#f7f5f0', '#2b59e8', '#f2b705', '#3b4552', '#1c1f24', '#e6d5b8']
for (const hex of required) {
  if (!lower.includes(hex)) {
    console.error(`quarry missing locked swatch ${hex}`)
    process.exit(1)
  }
}

if (!/--warning:\s*#f2b705/i.test(quarryCss) || !/--warning-foreground:\s*#1c1f24/i.test(quarryCss)) {
  console.error('quarry warning tokens must be yellow surface + near-black ink')
  process.exit(1)
}

if (!/--background:\s*#f7f5f0/i.test(quarryCss) || !/--primary:\s*#2b59e8/i.test(quarryCss)) {
  console.error('quarry UI must be warm-white surfaces with azurite primary')
  process.exit(1)
}

if (/--foreground:\s*#f2b705/i.test(quarryCss) || /--primary:\s*#f2b705/i.test(quarryCss)) {
  console.error('signal yellow must not be used as text or primary')
  process.exit(1)
}

if (!/--mokei-ground:\s*#e6d5b8/i.test(quarryCss) || /--background:\s*#e6d5b8/i.test(quarryCss)) {
  console.error('sandstone must be the ground role, not the UI background')
  process.exit(1)
}

if (!quarryTs.includes("deriveDetailRamp(QUARRY_DETAIL_DARK, QUARRY_BASE)")) {
  console.error('quarry detail ramp must be derived from #1C1F24 toward #F7F5F0')
  process.exit(1)
}

if (!quarryTs.includes('whiteFills: true')) {
  console.error('quarry must set whiteFills so large surfaces stay on base')
  process.exit(1)
}

if (!materialsTs.includes('useFillRole') || !materialsTs.includes('whiteFills')) {
  console.error('materials API must expose whiteFills / useFillRole')
  process.exit(1)
}

if (!materialsTs.includes("luminance(hex) >= 0.85")) {
  console.error('isNearWhite must treat luminance >= 0.85 as near-white')
  process.exit(1)
}

if (!yardlineTs.includes("base: '#f7f9fd'") || !yardlineTs.includes("accent1: '#2563eb'")) {
  console.error('yardline materials must keep the existing playground hexes')
  process.exit(1)
}

if (!blankTs.includes("base: '#f6efe4'")) {
  console.error('blank base must be near-white')
  process.exit(1)
}

function parseHex(hex) {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixHex(a, b, t) {
  const pa = parseHex(a)
  const pb = parseHex(b)
  const m = (i) => Math.round(pa[i] + (pb[i] - pa[i]) * t)
  return `#${[m(0), m(1), m(2)].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

const mid = mixHex('#1C1F24', '#F7F5F0', 0.35)
const light = mixHex('#1C1F24', '#F7F5F0', 0.72)
if (!quarryCss.toLowerCase().includes(`--mokei-detail-mid: ${mid}`) || !quarryCss.toLowerCase().includes(`--mokei-detail-light: ${light}`)) {
  console.error(`quarry CSS detail ramp must be ${mid} / ${light}`)
  process.exit(1)
}

console.log('theme roles ok')
console.log(`  quarry detail ramp ${mid} ${light}`)
