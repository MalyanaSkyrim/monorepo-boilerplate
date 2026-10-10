import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const shell = process.platform === 'win32'

function commandOutput(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', shell })
  if (result.error || result.status !== 0) return null
  return (result.stdout || '').trim()
}

/** Turns ">=24.11.0", "^24.1", "v24" or "24.x" into [24, 11, 0]. */
export function parseMinVersion(range) {
  const match = String(range).match(/(\d+)(?:\.(\d+|x))?(?:\.(\d+|x))?/)
  if (!match) return null
  return [match[1], match[2], match[3]].map((part) =>
    part && part !== 'x' ? Number(part) : 0,
  )
}

export function satisfiesMin(version, min) {
  const current = parseMinVersion(version)
  if (!current || !min) return true
  for (let i = 0; i < 3; i++) {
    if (current[i] !== min[i]) return current[i] > min[i]
  }
  return true
}

/** Node version the template asks for: .nvmrc, .node-version, then engines. */
export function readNodeRequirement(root) {
  for (const file of ['.nvmrc', '.node-version']) {
    const filePath = path.join(root, file)
    if (fs.existsSync(filePath)) {
      const value = fs.readFileSync(filePath, 'utf8').trim()
      if (parseMinVersion(value)) return { range: value, source: file }
    }
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
  )
  const range = pkg.engines?.node
  return range ? { range, source: 'package.json engines' } : null
}

export function checkNode(root) {
  const requirement = readNodeRequirement(root)
  const ok = requirement
    ? satisfiesMin(process.version, parseMinVersion(requirement.range))
    : true
  return { ok, version: process.version, requirement }
}

export function checkTool(cmd) {
  const output = commandOutput(cmd, ['--version'])
  return output ? output.split('\n')[0] : null
}

export function checkDocker() {
  const version = checkTool('docker')
  if (!version) return { installed: false, compose: false, running: false }
  return {
    installed: true,
    version,
    compose: commandOutput('docker', ['compose', 'version']) !== null,
    running:
      commandOutput('docker', ['info', '--format', '{{.ServerVersion}}']) !==
      null,
  }
}
