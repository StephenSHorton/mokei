import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const built = spawnSync('npx', ['tsc', '-p', 'tsconfig.kit.json'], {
  cwd: root,
  stdio: 'inherit',
})
if (built.status !== 0) process.exit(built.status ?? 1)

const themeDir = path.join(root, 'pkg/kit/theme')
mkdirSync(themeDir, { recursive: true })
for (const file of ['tokens.css', 'preset.css', 'mokei.css']) {
  cpSync(path.join(root, 'src/kit/theme', file), path.join(themeDir, file))
}

console.log('kit written to pkg/')
