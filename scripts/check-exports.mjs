import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Resolve every `package.json` `exports` entry of an installed `mokei`.
 * Run from a consumer directory (`cwd` has `node_modules/mokei`).
 *
 *   node scripts/check-exports.mjs
 */
const consumerRoot = process.cwd()
const requireFromConsumer = createRequire(path.join(consumerRoot, 'package.json'))

function findMokeiRoot() {
  const fallback = path.join(consumerRoot, 'node_modules/mokei')
  if (existsSync(path.join(fallback, 'package.json'))) return fallback
  try {
    return path.dirname(requireFromConsumer.resolve('mokei/package.json'))
  } catch {
    throw new Error(`mokei is not installed in ${consumerRoot}`)
  }
}

function specifierFor(subpath) {
  return subpath === '.' ? 'mokei' : `mokei/${subpath.replace(/^\.\//, '')}`
}

function flattenTarget(target) {
  if (typeof target === 'string') return [{ condition: 'default', rel: target }]
  if (!target || typeof target !== 'object') return []
  return Object.entries(target).map(([condition, rel]) => ({ condition, rel }))
}

const root = findMokeiRoot()
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!pkg.exports || typeof pkg.exports !== 'object') {
  console.error('mokei package.json has no exports map')
  process.exit(1)
}

const ok = []
const failed = []

for (const [subpath, target] of Object.entries(pkg.exports)) {
  const specifier = specifierFor(subpath)
  const entries = flattenTarget(target)
  if (!entries.length) {
    failed.push(`${specifier}: empty export target`)
    continue
  }

  for (const { condition, rel } of entries) {
    if (typeof rel !== 'string') {
      failed.push(`${specifier} [${condition}]: unsupported target ${JSON.stringify(rel)}`)
      continue
    }
    const abs = path.resolve(root, rel)
    if (!existsSync(abs)) {
      failed.push(`${specifier} [${condition}]: missing file ${rel}`)
      continue
    }
    if (condition === 'types') {
      ok.push(`${specifier} [types] ${rel}`)
      continue
    }
    try {
      const resolved = requireFromConsumer.resolve(specifier)
      ok.push(`${specifier} [${condition}] ${resolved}`)
    } catch (error) {
      failed.push(`${specifier} [${condition}]: require.resolve failed (${error.message})`)
    }
  }
}

for (const line of ok) console.log('ok  ', line)
if (failed.length) {
  console.error('\nexport resolve failures:')
  for (const line of failed) console.error('FAIL', line)
  process.exit(1)
}
console.log(`\n${ok.length} export targets resolved`)
