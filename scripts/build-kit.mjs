import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const built = spawnSync('npx', ['tsc', '-p', 'tsconfig.kit.json'], {
  cwd: root,
  stdio: 'inherit',
})
if (built.status !== 0) process.exit(built.status ?? 1)

const themeNames = ['yardline.css', 'blank.css', 'quarry.css']
const themesSrc = path.join(root, 'src/kit/themes')
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

console.log('kit written to pkg/')
