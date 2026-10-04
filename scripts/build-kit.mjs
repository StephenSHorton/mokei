import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const built = spawnSync('npx', ['tsc', '-p', 'tsconfig.kit.json'], {
  cwd: root,
  stdio: 'inherit',
})
if (built.status !== 0) process.exit(built.status ?? 1)

const themesSrc = path.join(root, 'src/kit/themes')
const preferred = ['yardline.css', 'blank.css', 'quarry.css']
const onDisk = readdirSync(themesSrc).filter((file) => file.endsWith('.css'))
const themeNames = [
  ...preferred.filter((file) => onDisk.includes(file)),
  ...onDisk.filter((file) => !preferred.includes(file)).sort(),
]
if (!themeNames.length) {
  console.error('src/kit/themes/ has no CSS files')
  process.exit(1)
}
const tokens = [
  '/* Aggregator for the shadcn registry. Source of truth: src/kit/themes/*.css */',
  '',
  ...themeNames.map((file) => readFileSync(path.join(themesSrc, file), 'utf8')),
].join('\n')
writeFileSync(path.join(root, 'src/kit/theme/tokens.css'), tokens)

const themeDir = path.join(root, 'pkg/kit/theme')
mkdirSync(themeDir, { recursive: true })
for (const file of ['tokens.css', 'preset.css', 'mokei.css']) {
  cpSync(path.join(root, 'src/kit/theme', file), path.join(themeDir, file))
}

const themesOut = path.join(root, 'pkg/kit/themes')
mkdirSync(themesOut, { recursive: true })
for (const file of themeNames) {
  cpSync(path.join(themesSrc, file), path.join(themesOut, file))
}

const pkgJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const missing = []
for (const target of Object.values(pkgJson.exports ?? {})) {
  const rels = typeof target === 'string' ? [target] : Object.values(target).filter((rel) => typeof rel === 'string')
  for (const rel of rels) {
    if (!existsSync(path.resolve(root, rel))) missing.push(rel)
  }
}
if (missing.length) {
  console.error('package.json exports point at missing files:\n' + missing.map((rel) => `  ${rel}`).join('\n'))
  process.exit(1)
}

console.log('kit written to pkg/')
console.log(
  'theme CSS:',
  themeNames.map((file) => `pkg/kit/themes/${file}`).join(', '),
)
