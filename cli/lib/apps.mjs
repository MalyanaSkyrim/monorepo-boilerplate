import fs from 'node:fs'
import path from 'node:path'

// Template manifest listing the apps, presets and how to remove each app.
export const MANIFEST_FILE = 'boilerplate.json'

export function loadManifest(root) {
  const file = path.join(root, MANIFEST_FILE)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function requiredApps(manifest) {
  return Object.entries(manifest.apps)
    .filter(([, app]) => app.required)
    .map(([id]) => id)
}

/**
 * Turns --preset / --apps into a list of app ids. Returns { apps } or
 * { error } with a message listing the valid values.
 */
export function resolveApps(manifest, { preset, apps }) {
  const known = Object.keys(manifest.apps)
  if (apps) {
    const wanted = apps
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    const unknown = wanted.filter((id) => !known.includes(id))
    if (unknown.length > 0) {
      return {
        error: `Unknown app "${unknown.join('", "')}". Choose from: ${known.join(', ')}.`,
      }
    }
    return { apps: withRequired(manifest, wanted) }
  }
  const name = preset || manifest.defaultPreset
  const chosen = manifest.presets[name]
  if (!chosen) {
    return {
      error: `Unknown preset "${name}". Choose from: ${Object.keys(manifest.presets).join(', ')}.`,
    }
  }
  return { apps: withRequired(manifest, chosen.apps) }
}

export function withRequired(manifest, apps) {
  const set = new Set([...requiredApps(manifest), ...apps])
  // Keep the manifest's order so output reads the same every time.
  return Object.keys(manifest.apps).filter((id) => set.has(id))
}

function workspaceManifests(root) {
  const files = [path.join(root, 'package.json')]
  for (const dir of ['apps', 'packages', 'tooling']) {
    const base = path.join(root, dir)
    if (!fs.existsSync(base)) continue
    for (const entry of fs.readdirSync(base)) {
      const file = path.join(base, entry, 'package.json')
      if (fs.existsSync(file)) files.push(file)
    }
  }
  return files
}

/** Removes a shared package once no remaining workspace depends on it. */
function removeUnusedPackage(root, packageDir) {
  const dir = path.join(root, packageDir)
  const manifestPath = path.join(dir, 'package.json')
  if (!fs.existsSync(manifestPath)) return false
  const { name } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const usedBy = workspaceManifests(root).filter((file) => {
    if (path.dirname(file) === dir) return false
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
    return [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies].some(
      (deps) => deps && name in deps,
    )
  })
  if (usedBy.length > 0) return false
  fs.rmSync(dir, { recursive: true, force: true })
  return true
}

/**
 * Deletes every app not in `selected`, with its files, edits and the shared
 * packages only it used. Returns what was removed and edits that matched
 * nothing (a sign the manifest is out of date).
 */
export function applyAppSelection(root, manifest, selected) {
  const removed = []
  const stale = []
  const candidates = []
  for (const [id, app] of Object.entries(manifest.apps)) {
    if (selected.includes(id)) continue
    removed.push(id)
    for (const target of app.remove || []) {
      fs.rmSync(path.join(root, target), { recursive: true, force: true })
    }
    for (const { file, pattern } of app.edits || []) {
      const filePath = path.join(root, file)
      if (!fs.existsSync(filePath)) continue
      const text = fs.readFileSync(filePath, 'utf8')
      const updated = text.replace(new RegExp(pattern, 'gm'), '')
      if (updated === text) stale.push(`${file}: ${pattern}`)
      else fs.writeFileSync(filePath, updated)
    }
    candidates.push(...(app.packages || []))
  }
  const removedPackages = candidates.filter((dir) =>
    removeUnusedPackage(root, dir),
  )
  return { removed, removedPackages, stale }
}
