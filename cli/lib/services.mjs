import net from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' })
    const done = (open) => {
      socket.destroy()
      resolve(open)
    }
    socket.setTimeout(1000)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

export async function waitForPort(port, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await portOpen(port)) return true
    await sleep(1000)
  }
  return false
}

/**
 * Starts every docker compose service, waits for their published ports,
 * then creates the database schema and seeds it. Returns the manual steps
 * left for the user when something fails.
 */
export async function startServices({ root, composePorts, run, step, warn }) {
  // docker-compose.yml mounts volumes under ${PWD}, so it must be the project.
  const env = { ...process.env, PWD: root }

  step('Starting docker compose services')
  if (!run('docker', ['compose', 'up', '-d'], { cwd: root, env })) {
    warn('docker compose up failed.')
    return ['pnpm db:start', 'pnpm db:push', 'pnpm db:seed']
  }

  for (const { port, label } of composePorts) {
    if (!(await waitForPort(port))) {
      warn(`${label} is not answering on port ${port} yet.`)
    }
  }

  step('Creating the database schema')
  let pushed = false
  for (let attempt = 1; attempt <= 3 && !pushed; attempt++) {
    // The database can accept connections a moment before it accepts SQL.
    if (attempt > 1) await sleep(5000)
    pushed = run('pnpm', ['db:push'], { cwd: root })
  }
  if (!pushed) {
    warn('pnpm db:push failed.')
    return ['pnpm db:push', 'pnpm db:seed']
  }
  if (!run('pnpm', ['db:push:test'], { cwd: root })) {
    warn('Could not create the test database (pnpm db:push:test).')
  }

  step('Seeding the database')
  if (!run('pnpm', ['db:seed'], { cwd: root })) {
    warn('pnpm db:seed failed.')
    return ['pnpm db:seed']
  }
  return []
}
