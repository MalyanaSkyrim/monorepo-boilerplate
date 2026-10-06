#!/usr/bin/env node
/**
 * create-monorepo-boilerplate
 *
 * Scaffolds a new project from the monorepo boilerplate: downloads the latest
 * template from GitHub, renames the project, package scope, brand and mobile
 * identifiers, checks Node, pnpm and Docker, frees up local ports, then
 * initializes git, installs dependencies, starts the docker compose services
 * and sets up the database.
 */
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import {
  checkDocker,
  checkNode,
  checkTool,
  parseMinVersion,
} from './lib/checks.mjs'
import {
  applyPortChanges,
  discoverPorts,
  findFreePort,
  isPortFree,
} from './lib/ports.mjs'
import { startServices } from './lib/services.mjs'

const DEFAULT_TEMPLATE = 'MalyanaSkyrim/monorepo-boilerplate'
const DEFAULT_REF = 'main'
const CLI_NAME = 'create-monorepo-boilerplate'

// Paths dropped from the template: the CLI itself and VCS metadata.
const SKIP_PATHS = new Set(['.git', 'node_modules', 'cli'])
const MAX_REWRITE_BYTES = 5 * 1024 * 1024

const color = (code) => (text) =>
  process.stdout.isTTY && !process.env.NO_COLOR
    ? `\x1b[${code}m${text}\x1b[0m`
    : text
const bold = color(1)
const dim = color(2)
const green = color(32)
const red = color(31)
const cyan = color(36)
const yellow = color(33)

const HELP = `
${bold('Usage:')} npx ${CLI_NAME} ${cyan('<project-name>')} [options]

Creates a new app or SaaS monorepo from ${DEFAULT_TEMPLATE}.

${bold('Options:')}
  --display-name <name>  Human readable product name (default: from project name)
  --scope <scope>        Workspace package scope, without "@" (default: project name)
  --bundle-id <id>       iOS/Android bundle identifier (default: com.example.<name>)
  --template <repo|dir>  GitHub "owner/repo" or a local directory (default: ${DEFAULT_TEMPLATE})
  --ref <ref>            Branch, tag or commit of the template (default: ${DEFAULT_REF})
  --no-install           Skip "pnpm install"
  --no-git               Skip "git init" and the initial commit
  --no-services          Skip starting docker compose services and the database setup
  --skip-checks          Continue when the Node version is too old
  -y, --yes              Accept defaults without prompting
  -h, --help             Show this help
  -v, --version          Show the CLI version

${bold('Examples:')}
  npx ${CLI_NAME} my-app
  pnpm create monorepo-boilerplate my-app --display-name "My App" --bundle-id com.acme.myapp
`

function fail(message) {
  console.error(`\n${red('✖')} ${message}\n`)
  process.exit(1)
}

function step(message) {
  console.log(`${cyan('◆')} ${message}`)
}

function warn(message) {
  console.log(`  ${yellow('▲')} ${message}`)
}

function readOwnVersion() {
  const pkgPath = new URL('./package.json', import.meta.url)
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version
}

function parseCli(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      'display-name': { type: 'string' },
      scope: { type: 'string' },
      'bundle-id': { type: 'string' },
      template: { type: 'string', default: DEFAULT_TEMPLATE },
      ref: { type: 'string', default: DEFAULT_REF },
      'no-install': { type: 'boolean', default: false },
      'no-git': { type: 'boolean', default: false },
      'no-services': { type: 'boolean', default: false },
      'skip-checks': { type: 'boolean', default: false },
      yes: { type: 'boolean', short: 'y', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  })
  return { values, target: positionals[0] }
}

async function ask(question, fallback) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const suffix = fallback ? dim(` (${fallback})`) : ''
  const answer = (
    await rl.question(`${cyan('?')} ${question}${suffix} `)
  ).trim()
  rl.close()
  return answer || fallback
}

export function toSlug(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function toDisplayName(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function deriveNames({ slug, displayName, scope, bundleId }) {
  const display = displayName || toDisplayName(slug)
  const pascal = display.replace(/[^A-Za-z0-9]/g, '') || 'App'
  const compact = slug.replace(/-/g, '')
  const bundleSegment = /^[a-z]/.test(compact) ? compact : `app${compact}`
  return {
    slug,
    display,
    pascal,
    scope: toSlug((scope || slug).replace(/^@/, '')),
    bundleId: bundleId || `com.example.${bundleSegment}`,
    snake: slug.replace(/-/g, '_'),
  }
}

/** Ordered text replacements applied to every text file in the template. */
export function buildReplacements(names) {
  return [
    [/AppBoilerplate/g, () => names.pascal],
    [/App Boilerplate/g, () => names.display],
    [/app-boilerplate/g, () => names.slug],
    [/com\.example\.app\b/g, () => names.bundleId],
    [/@app\//g, () => `@${names.scope}/`],
    [/\bapp_(dev|test)\b/g, (_, env) => `${names.snake}_${env}`],
  ]
}

export function applyReplacements(text, replacements) {
  return replacements.reduce(
    (out, [pattern, replace]) => out.replace(pattern, replace),
    text,
  )
}

function isEmptyDir(dir) {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  })
  return result.status === 0
}

async function downloadTemplate(template, ref, dest) {
  const localDir = path.resolve(template)
  if (fs.existsSync(localDir) && fs.statSync(localDir).isDirectory()) {
    fs.cpSync(localDir, dest, {
      recursive: true,
      filter: (src) =>
        !SKIP_PATHS.has(path.relative(localDir, src)) &&
        path.basename(src) !== 'node_modules',
    })
    return
  }

  if (!/^[\w.-]+\/[\w.-]+$/.test(template)) {
    fail(
      `Template must be "owner/repo" or a local directory, got "${template}".`,
    )
  }

  const url = `https://codeload.github.com/${template}/tar.gz/${encodeURIComponent(ref)}`
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${CLI_NAME}-`))
  const archive = path.join(tmpDir, 'template.tar.gz')
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GET ${url} returned ${response.status}`)
    }
    fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()))
    fs.mkdirSync(dest, { recursive: true })
    const extracted = spawnSync(
      'tar',
      ['-xzf', archive, '--strip-components=1', '-C', dest],
      { stdio: 'inherit' },
    )
    if (extracted.status !== 0) throw new Error('tar could not extract it')
  } catch (error) {
    // Fall back to git when the tarball route is unavailable.
    step(`Download failed (${error.message}), trying git clone`)
    fs.rmSync(dest, { recursive: true, force: true })
    const cloned = run('git', [
      'clone',
      '--depth',
      '1',
      '--branch',
      ref,
      `https://github.com/${template}.git`,
      dest,
    ])
    if (!cloned) fail(`Could not download ${template}#${ref}.`)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }

  for (const entry of SKIP_PATHS) {
    fs.rmSync(path.join(dest, entry), { recursive: true, force: true })
  }
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0)
}

/** Rewrites file contents and file names in place. Returns files changed. */
function rewriteTree(root, replacements) {
  let changed = 0
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        if (fs.statSync(fullPath).size > MAX_REWRITE_BYTES) continue
        const buffer = fs.readFileSync(fullPath)
        if (isBinary(buffer)) continue
        const before = buffer.toString('utf8')
        const after = applyReplacements(before, replacements)
        if (after !== before) {
          fs.writeFileSync(fullPath, after)
          changed++
        }
      }
      const renamed = applyReplacements(entry.name, replacements)
      if (renamed !== entry.name) {
        fs.renameSync(fullPath, path.join(dir, renamed))
      }
    }
  }
  walk(root)
  return changed
}

function setupEnv(root) {
  const example = path.join(root, '.env.example')
  const env = path.join(root, '.env')
  if (fs.existsSync(example) && !fs.existsSync(env)) {
    fs.copyFileSync(example, env)
    return true
  }
  return false
}

async function confirm(question, fallback = true) {
  const hint = fallback ? 'Y/n' : 'y/N'
  const answer = (await ask(`${question} ${dim(`(${hint})`)}`, '')) || ''
  if (!answer) return fallback
  return /^y(es)?$/i.test(answer)
}

function printCheck(ok, label, detail = '') {
  const mark = ok === true ? green('✔') : ok === false ? red('✖') : yellow('▲')
  console.log(`  ${mark} ${label}${detail ? dim(`  ${detail}`) : ''}`)
}

/** Checks Node, pnpm, git and Docker. Returns what later steps can rely on. */
async function checkRequirements(root, { interactive, skipChecks }) {
  step('Checking requirements')
  const node = checkNode(root)
  const required = node.requirement
    ? `requires ${node.requirement.range} (${node.requirement.source})`
    : ''
  printCheck(node.ok, `Node ${node.version}`, required)

  const pnpm = checkTool('pnpm')
  printCheck(
    pnpm ? true : null,
    pnpm ? `pnpm ${pnpm}` : 'pnpm not found',
    pnpm ? '' : 'run "corepack enable"',
  )

  const git = checkTool('git')
  printCheck(git ? true : null, git || 'git not found')

  let docker = checkDocker()
  if (!docker.installed) {
    printCheck(
      null,
      'Docker not found',
      'install Docker Desktop: https://docs.docker.com/get-docker/',
    )
  } else {
    printCheck(
      docker.compose ? true : null,
      docker.version,
      docker.compose ? 'compose available' : 'docker compose plugin missing',
    )
    while (!docker.running && interactive) {
      printCheck(null, 'Docker is not running')
      const answer = await ask(
        'Start Docker, then press Enter to retry, or type "skip":',
        '',
      )
      if (/^s(kip)?$/i.test(answer || '')) break
      docker = checkDocker()
    }
    printCheck(
      docker.running ? true : null,
      docker.running ? 'Docker is running' : 'Docker is not running',
    )
  }

  if (!node.ok && !skipChecks) {
    const message = `Node ${node.version} is older than the ${node.requirement.range} this project needs. Install it with "nvm install ${parseMinVersion(node.requirement.range)[0]}" or from https://nodejs.org.`
    if (!interactive)
      return { abort: `${message}\nPass --skip-checks to continue anyway.` }
    console.log(`\n${yellow('▲')} ${message}`)
    if (!(await confirm('Continue anyway?', false)))
      return { abort: 'Stopped. Nothing was kept.' }
  }

  return { pnpm: Boolean(pnpm), git: Boolean(git), docker }
}

/** Finds ports already in use and picks (or asks for) free ones. */
async function resolvePorts(root, { interactive }) {
  const ports = discoverPorts(root)
  if (ports.length === 0) return ports
  step('Checking local ports')
  const taken = new Set(ports.map(({ port }) => port))
  const changes = new Map()
  for (const entry of ports) {
    if (await isPortFree(entry.port)) {
      printCheck(true, `${entry.port}`, entry.label)
      continue
    }
    const suggestion = await findFreePort(entry.port, taken)
    printCheck(false, `${entry.port} is in use`, entry.label)
    let chosen = suggestion
    if (interactive) {
      for (;;) {
        const answer = await ask(
          `  Port for ${entry.label}:`,
          String(suggestion ?? ''),
        )
        const port = Number(answer)
        if (
          Number.isInteger(port) &&
          port > 0 &&
          port < 65536 &&
          (port === entry.port || !taken.has(port))
        ) {
          chosen = port
          if (port === entry.port || (await isPortFree(port))) break
          console.log(dim(`  ${port} is in use too.`))
        } else {
          console.log(dim('  Enter a free port number.'))
        }
      }
    } else if (suggestion === null) {
      console.log(dim(`  No free port found near ${entry.port}; keeping it.`))
      continue
    }
    if (chosen !== entry.port) {
      taken.add(chosen)
      changes.set(entry.port, chosen)
      entry.port = chosen
      console.log(dim(`  Using ${chosen} for ${entry.label}`))
    }
  }
  applyPortChanges(root, changes)
  return ports
}

/** Replaces the "change-me" placeholders in .env with random secrets. */
function generateSecrets(root) {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  const updated = text.replace(
    /^((?:AUTH_SECRET|API_KEY)=)"change-me"$/gm,
    (_, key) => `${key}"${randomBytes(32).toString('hex')}"`,
  )
  if (updated !== text) fs.writeFileSync(envPath, updated)
}

async function main() {
  let parsed
  try {
    parsed = parseCli(process.argv.slice(2))
  } catch (error) {
    fail(`${error.message}\nRun with --help to see the options.`)
  }
  const { values } = parsed
  let { target } = parsed

  if (values.help) {
    console.log(HELP)
    return
  }
  if (values.version) {
    console.log(readOwnVersion())
    return
  }

  console.log(`\n${bold(CLI_NAME)} ${dim(`v${readOwnVersion()}`)}\n`)

  const interactive = process.stdin.isTTY && !values.yes
  if (!target) {
    if (!interactive)
      fail(
        'Missing project name. Usage: npx create-monorepo-boilerplate <project-name>',
      )
    target = await ask('Project name:', 'my-app')
  }

  const dest = path.resolve(target)
  const slug = toSlug(path.basename(dest))
  if (!slug) fail(`"${target}" is not a usable project name.`)
  if (!isEmptyDir(dest)) fail(`${dest} already exists and is not empty.`)

  let displayName = values['display-name']
  if (!displayName && interactive) {
    displayName = await ask('Display name:', toDisplayName(slug))
  }

  const names = deriveNames({
    slug,
    displayName,
    scope: values.scope,
    bundleId: values['bundle-id'],
  })

  step(`Downloading ${values.template}${dim(`#${values.ref}`)}`)
  await downloadTemplate(values.template, values.ref, dest)

  const env = await checkRequirements(dest, {
    interactive,
    skipChecks: values['skip-checks'],
  })
  if (env.abort) {
    fs.rmSync(dest, { recursive: true, force: true })
    fail(env.abort)
  }

  step(
    `Renaming to ${bold(names.display)} ${dim(`(@${names.scope}/*, ${names.bundleId})`)}`,
  )
  const changed = rewriteTree(dest, buildReplacements(names))
  console.log(dim(`  ${changed} files updated`))

  if (setupEnv(dest)) {
    generateSecrets(dest)
    step('Created .env with generated AUTH_SECRET and API_KEY')
  }

  const ports = await resolvePorts(dest, { interactive })

  const useGit = !values['no-git'] && env.git
  if (useGit) {
    step('Initializing git')
    run('git', ['init', '--quiet', '-b', 'main'], { cwd: dest })
  }

  let installed = false
  if (!values['no-install'] && env.pnpm) {
    step('Installing dependencies with pnpm')
    installed = run('pnpm', ['install'], { cwd: dest })
    if (installed) {
      step('Generating the Prisma client')
      run('pnpm', ['db:generate'], { cwd: dest })
    } else {
      warn('pnpm install failed, run it again later.')
    }
  }

  if (useGit) {
    run('git', ['add', '-A'], { cwd: dest, stdio: 'ignore' })
    const committed = run(
      'git',
      [
        'commit',
        '--quiet',
        '--no-verify',
        '-m',
        `Initial commit from ${CLI_NAME}`,
      ],
      { cwd: dest, stdio: 'ignore' },
    )
    if (!committed)
      console.log(
        dim('  Skipped the initial commit (set git user.name and user.email).'),
      )
  }

  // Services start after the commit so their data folders stay out of it.
  let pending = ['pnpm db:start', 'pnpm db:push', 'pnpm db:seed']
  if (values['no-services']) {
    console.log(dim('  Skipped starting services (--no-services).'))
  } else if (!installed) {
    console.log(
      dim('  Skipped starting services: dependencies are not installed.'),
    )
  } else if (!env.docker.running || !env.docker.compose) {
    console.log(dim('  Skipped starting services: Docker is not available.'))
  } else {
    pending = await startServices({
      root: dest,
      composePorts: ports.filter(
        ({ source }) => source === 'docker-compose.yml',
      ),
      run,
      step,
      warn,
    })
  }

  const relative = path.relative(process.cwd(), dest) || '.'
  console.log(
    `\n${green('✔')} ${bold(names.display)} is ready in ${cyan(relative)}\n`,
  )
  console.log('Next steps:')
  if (relative !== '.') console.log(`  cd ${relative}`)
  if (!installed) console.log('  pnpm install')
  for (const command of pending) console.log(`  ${command}`)
  console.log('  pnpm dev\n')
}

const isEntry =
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))

if (isEntry) {
  main().catch((error) => fail(error.stack || error.message))
}
