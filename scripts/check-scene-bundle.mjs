import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = mkdtempSync(path.join(tmpdir(), 'mokei-scene-'))
const outfile = path.join(outDir, 'scene.js')

const built = spawnSync(
  'npx',
  [
    'esbuild',
    'src/kit/scene/index.ts',
    '--bundle',
    '--format=esm',
    `--outfile=${outfile}`,
    '--platform=neutral',
    '--external:react',
    '--external:react-dom',
    '--external:react/jsx-runtime',
  ],
  { cwd: root, encoding: 'utf8' },
)

if (built.status !== 0) {
  console.error(built.stderr || built.stdout)
  process.exit(built.status ?? 1)
}

const bundle = readFileSync(outfile, 'utf8')
const leaks = ['WebGLRenderer', 'SoftBox', 'RoundedBox', 'forklift', 'Yardline', 'THREE.']
const found = leaks.filter((needle) => bundle.includes(needle))
if (found.length) {
  console.error('mokei/scene bundle pulled 3D / Yardline:', found.join(', '))
  process.exit(1)
}

console.log('scene bundle is three-free', `${bundle.length} bytes`)
