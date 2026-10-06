import assert from 'node:assert/strict'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { parseMinVersion, satisfiesMin } from './lib/checks.mjs'
import {
  applyPortChanges,
  findFreePort,
  isPortFree,
  parseComposePorts,
} from './lib/ports.mjs'

const COMPOSE = `services:
  cockroach:
    ports:
      - '26259:26257'
      - '8084:8080'
  redis-dev:
    ports:
      - '6381:6379'
`

test('parses node version ranges', () => {
  assert.deepEqual(parseMinVersion('>=24.11.0'), [24, 11, 0])
  assert.deepEqual(parseMinVersion('v20'), [20, 0, 0])
  assert.equal(satisfiesMin('v24.11.0', [24, 11, 0]), true)
  assert.equal(satisfiesMin('v24.12.1', [24, 11, 0]), true)
  assert.equal(satisfiesMin('v22.22.0', [24, 11, 0]), false)
})

test('reads host ports from docker compose', () => {
  assert.deepEqual(
    parseComposePorts(COMPOSE).map(({ port, label, role }) => [
      port,
      label,
      role,
    ]),
    [
      [26259, 'database (cockroach)', 'database'],
      [8084, 'database console (cockroach)', undefined],
      [6381, 'Redis (redis-dev)', undefined],
    ],
  )
})

test('rewrites changed ports in compose and .env', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ports-'))
  fs.writeFileSync(path.join(root, 'docker-compose.yml'), COMPOSE)
  fs.writeFileSync(
    path.join(root, '.env'),
    'DATABASE_URL="postgresql://root@localhost:26259/app_dev"\nOTHER=126259\n',
  )
  applyPortChanges(
    root,
    new Map([
      [26259, 26260],
      [6381, 6382],
    ]),
  )
  const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf8')
  assert.match(compose, /'26260:26257'/)
  assert.match(compose, /'6382:6379'/)
  assert.equal(
    fs.readFileSync(path.join(root, '.env'), 'utf8'),
    'DATABASE_URL="postgresql://root@localhost:26260/app_dev"\nOTHER=126259\n',
  )
  fs.rmSync(root, { recursive: true })
})

test('detects a busy port and suggests the next free one', async () => {
  const server = net.createServer().listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  assert.equal(await isPortFree(port), false)
  const next = await findFreePort(port, new Set([port + 1]))
  assert.ok(next > port + 1)
  server.close()
})
