import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public/r')
const base = (process.env.MOKEI_REGISTRY_BASE ?? 'https://stephenshorton.github.io/mokei').replace(/\/$/, '')

mkdirSync(outDir, { recursive: true })

const built = spawnSync('npx', ['shadcn', 'build', path.join(root, 'registry.json'), '-o', outDir], {
  cwd: root,
  stdio: 'inherit',
})
if (built.status !== 0) process.exit(built.status ?? 1)

function rewriteDep(dep) {
  if (typeof dep !== 'string') return dep
  if (dep.startsWith('@mokei/')) return `${base}/r/${dep.slice('@mokei/'.length)}.json`
  return dep
}

function rewriteItem(item) {
  if (!item || typeof item !== 'object') return item
  if (Array.isArray(item.registryDependencies)) {
    item.registryDependencies = item.registryDependencies.map(rewriteDep)
  }
  return item
}

for (const file of readdirSync(outDir)) {
  if (!file.endsWith('.json')) continue
  const full = path.join(outDir, file)
  const json = JSON.parse(readFileSync(full, 'utf8'))
  if (Array.isArray(json.items)) json.items.forEach(rewriteItem)
  rewriteItem(json)
  writeFileSync(full, `${JSON.stringify(json, null, 2)}\n`)
}

console.log(`registry written to ${outDir} (dependency base ${base})`)
