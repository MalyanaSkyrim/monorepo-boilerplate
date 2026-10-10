import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

const COMPOSE_FILE = 'docker-compose.yml'

// Files that hold local ports. A changed port is rewritten in each of them.
const PORT_FILES = [
  COMPOSE_FILE,
  '.env.example',
  '.env',
  'apps/web/package.json',
  'apps/mobile/package.json',
  'tooling/bruno/api/environments/Dev.bru',
  'README.md',
]

// Container ports we can name. Anything else is labelled service:port.
const KNOWN_CONTAINER_PORTS = {
  26257: { label: 'database', role: 'database' },
  5432: { label: 'database', role: 'database' },
  8080: { label: 'database console' },
  6379: { label: 'Redis' },
}

function read(root, file) {
  const filePath = path.join(root, file)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
}

/** Host ports published in docker-compose.yml, by service. */
export function parseComposePorts(text) {
  const ports = []
  let service = null
  let inServices = false
  for (const line of text.split('\n')) {
    if (/^services:\s*$/.test(line)) {
      inServices = true
      continue
    }
    if (/^\S/.test(line)) inServices = false
    if (!inServices) continue
    const serviceMatch = line.match(/^ {2}([\w.-]+):\s*$/)
    if (serviceMatch) service = serviceMatch[1]
    const portMatch = line.match(/^\s+-\s*['"]?(?:[\d.]+:)?(\d+):(\d+)/)
    if (service && portMatch) {
      const containerPort = Number(portMatch[2])
      const known = KNOWN_CONTAINER_PORTS[containerPort]
      ports.push({
        port: Number(portMatch[1]),
        label: known
          ? `${known.label} (${service})`
          : `${service}:${containerPort}`,
        role: known?.role,
        source: COMPOSE_FILE,
      })
    }
  }
  return ports
}

/** Every local port the generated project uses. */
export function discoverPorts(root) {
  const ports = []
  const compose = read(root, COMPOSE_FILE)
  if (compose) ports.push(...parseComposePorts(compose))

  const env = read(root, '.env.example') || ''
  const apiPort = env.match(/^API_AUTH_PORT=(\d+)/m)
  if (apiPort) {
    ports.push({ port: Number(apiPort[1]), label: 'auth API', source: '.env' })
  }
  for (const [file, label] of [
    ['apps/web/package.json', 'web app'],
    ['apps/mobile/package.json', 'Expo Metro'],
  ]) {
    const port = (read(root, file) || '').match(/--port[= ](\d+)/)
    if (port) ports.push({ port: Number(port[1]), label, source: file })
  }

  const seen = new Set()
  return ports.filter(({ port }) => !seen.has(port) && seen.add(port))
}

function acceptsConnection(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host })
    const done = (inUse) => {
      socket.destroy()
      resolve(inUse)
    }
    socket.setTimeout(400)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', (error) =>
      resolve(error.code !== 'EADDRINUSE' && error.code !== 'EACCES'),
    )
    server.listen({ port, exclusive: true }, () =>
      server.close(() => resolve(true)),
    )
  })
}

export async function isPortFree(port) {
  // Connecting catches services bound to 127.0.0.1 only, which a wildcard
  // listen can miss on macOS.
  if (await acceptsConnection(port, '127.0.0.1')) return false
  return canListen(port)
}

export async function findFreePort(start, taken) {
  for (let port = start + 1; port < Math.min(start + 200, 65536); port++) {
    if (!taken.has(port) && (await isPortFree(port))) return port
  }
  return null
}

/** Rewrites changed ports (Map old -> new) in every file that holds one. */
export function applyPortChanges(root, changes) {
  if (changes.size === 0) return
  const olds = [...changes.keys()].join('|')
  const generic = new RegExp(`(?<!\\d)(${olds})(?!\\d)`, 'g')
  // In docker-compose.yml only the host side of "host:container" changes.
  const composeHost = new RegExp(`(?<![\\d.])(${olds})(?=:\\d)`, 'g')
  for (const file of PORT_FILES) {
    const text = read(root, file)
    if (text === null) continue
    const pattern = file === COMPOSE_FILE ? composeHost : generic
    const updated = text.replace(pattern, (old) =>
      String(changes.get(Number(old))),
    )
    if (updated !== text) fs.writeFileSync(path.join(root, file), updated)
  }
}
