// tooling/scripts/infra.ts
// Sets up Google Cloud for staging and production with the Terraform
// configuration in infra/terraform. See infra/terraform/README.md.
import * as p from '@clack/prompts'
import { Command } from '@commander-js/extra-typings'
import { spawnSync } from 'child_process'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import color from 'picocolors'
import { z } from 'zod'

const ROOT = process.cwd()
const TF_DIR = path.join(ROOT, 'infra/terraform')
const BOOTSTRAP_DIR = path.join(TF_DIR, 'bootstrap')
const TFVARS = path.join(TF_DIR, 'terraform.tfvars')
const BACKEND_CONFIG = path.join(TF_DIR, 'backend.hcl')
const PLACEHOLDER_PROJECT = 'your-gcp-project-id'

// Generated on first push when the env file leaves them empty.
const GENERATED_SECRETS = ['AUTH_SECRET', 'API_KEY']
// Uploaded as a whole file by `infra:secrets dev`, never per key.
const DEV_SECRET = 'DEV_ENVIRONMENT_VARIABLES'

const secretNamesSchema = z.object({
  environments: z.record(z.string(), z.record(z.string(), z.string())),
  shared: z.record(z.string(), z.string()),
  required: z.record(z.string(), z.array(z.string())),
})
type SecretNames = z.infer<typeof secretNamesSchema>

const githubVariablesSchema = z.record(z.string(), z.string())

const billingAccountsSchema = z.array(
  z.object({ name: z.string(), displayName: z.string() }),
)

// ---------------------------------------------------------------------------
// Shell helpers
// ---------------------------------------------------------------------------

/** Runs a command attached to the terminal. Exits when it fails. */
function runInteractive(command: string, args: string[], cwd = ROOT) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (result.status !== 0) {
    p.cancel(color.red(`${command} ${args.join(' ')} failed.`))
    process.exit(result.status ?? 1)
  }
}

/** Runs a command and returns its stdout, or null when it fails. */
function capture(command: string, args: string[], input?: string) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  return result.status === 0 ? result.stdout.trim() : null
}

function hasCommand(command: string) {
  return capture(command, ['--version']) !== null
}

function terraformOutput<T>(name: string, schema: z.ZodType<T>): T {
  const raw = capture('terraform', [
    `-chdir=${TF_DIR}`,
    'output',
    '-json',
    name,
  ])
  if (raw === null) {
    p.cancel(
      color.red(
        `Could not read the Terraform output "${name}". Run ${color.cyan('pnpm infra:init')} first.`,
      ),
    )
    process.exit(1)
  }
  return schema.parse(JSON.parse(raw))
}

function exitIfCancelled<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.')
    process.exit(0)
  }
  return value
}

// ---------------------------------------------------------------------------
// terraform.tfvars
// ---------------------------------------------------------------------------

function readTfvar(name: string) {
  const text = fs.readFileSync(TFVARS, 'utf8')
  return text.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, 'm'))?.[1] ?? ''
}

function writeTfvar(name: string, value: string) {
  const text = fs.readFileSync(TFVARS, 'utf8')
  const pattern = new RegExp(`^(${name}\\s*=\\s*)"[^"]*"`, 'm')
  fs.writeFileSync(TFVARS, text.replace(pattern, `$1"${value}"`))
}

function projectId() {
  const id = readTfvar('project_id')
  if (!id || id === PLACEHOLDER_PROJECT) {
    p.cancel(
      color.red(
        `No project in infra/terraform/terraform.tfvars yet. Run ${color.cyan('pnpm infra:init')} first.`,
      ),
    )
    process.exit(1)
  }
  return id
}

function detectGithubRepository() {
  const remote = capture('git', ['remote', 'get-url', 'origin']) ?? ''
  return remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1] ?? ''
}

// ---------------------------------------------------------------------------
// Secret Manager
// ---------------------------------------------------------------------------

function latestSecretValue(project: string, secret: string) {
  return capture('gcloud', [
    'secrets',
    'versions',
    'access',
    'latest',
    `--secret=${secret}`,
    `--project=${project}`,
  ])
}

/** Adds a version unless the latest one already holds this value. */
function setSecret(project: string, secret: string, value: string) {
  if (latestSecretValue(project, secret) === value.trim()) return 'unchanged'
  const added = capture(
    'gcloud',
    [
      'secrets',
      'versions',
      'add',
      secret,
      '--data-file=-',
      `--project=${project}`,
    ],
    value,
  )
  if (added === null) {
    p.cancel(color.red(`Could not add a version to ${secret}.`))
    process.exit(1)
  }
  return 'updated'
}

function missingSecrets(project: string, names: string[]) {
  return names.filter((name) => latestSecretValue(project, name) === null)
}

function pushSecrets(
  project: string,
  secretNames: SecretNames,
  environment: string,
  file: string,
) {
  const filePath = path.resolve(ROOT, file)
  if (!fs.existsSync(filePath)) {
    p.cancel(color.red(`${file} not found.`))
    process.exit(1)
  }
  const content = fs.readFileSync(filePath, 'utf8')

  if (environment === 'dev') {
    const result = setSecret(project, DEV_SECRET, content)
    p.log.success(`${DEV_SECRET} ${result} from ${file}`)
    return
  }

  const names = secretNames.environments[environment]
  if (!names) {
    p.cancel(
      color.red(
        `Unknown environment "${environment}". Choose from: ${[...Object.keys(secretNames.environments), 'dev'].join(', ')}.`,
      ),
    )
    process.exit(1)
  }

  const values = dotenv.parse(content)
  const lines: string[] = []

  for (const [key, secret] of Object.entries(names)) {
    let value = values[key]?.trim()
    if (!value && GENERATED_SECRETS.includes(key)) {
      if (latestSecretValue(project, secret) !== null) continue
      value = randomBytes(32).toString('hex')
      lines.push(`${secret}: generated`)
      setSecret(project, secret, value)
      continue
    }
    if (!value) continue
    lines.push(`${secret}: ${setSecret(project, secret, value)}`)
  }

  for (const [key, secret] of Object.entries(secretNames.shared)) {
    if (key === DEV_SECRET) continue
    const value = values[key]?.trim()
    if (value) lines.push(`${secret}: ${setSecret(project, secret, value)}`)
  }

  p.note(lines.join('\n') || 'No values found.', `Secrets from ${file}`)

  const missing = missingSecrets(
    project,
    secretNames.required[environment] ?? [],
  )
  if (missing.length > 0) {
    p.log.warn(
      `Still empty, and needed before the ${environment} services can start: ${missing.join(', ')}`,
    )
  }
}

// ---------------------------------------------------------------------------
// GitHub repository variables
// ---------------------------------------------------------------------------

async function setGithubVariables() {
  const variables = terraformOutput('github_variables', githubVariablesSchema)
  const repository = readTfvar('github_repository')
  const commands = Object.entries(variables).map(
    ([name, value]) =>
      `gh variable set ${name} --repo ${repository} --body "${value}"`,
  )

  const canUseGh =
    hasCommand('gh') && capture('gh', ['auth', 'status']) !== null
  if (!canUseGh) {
    p.note(commands.join('\n'), 'Set these GitHub variables')
    return
  }

  const confirmed = exitIfCancelled(
    await p.confirm({
      message: `Set ${Object.keys(variables).length} repository variables on ${repository} with the gh CLI?`,
    }),
  )
  if (!confirmed) {
    p.note(commands.join('\n'), 'Set these GitHub variables')
    return
  }
  for (const [name, value] of Object.entries(variables)) {
    const ok = capture('gh', [
      'variable',
      'set',
      name,
      '--repo',
      repository,
      '--body',
      value,
    ])
    if (ok === null) p.log.error(`Could not set ${name}.`)
  }
  p.log.success(`GitHub variables set on ${repository}`)
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function ensureTools() {
  const missing = ['terraform', 'gcloud'].filter((tool) => !hasCommand(tool))
  if (missing.length > 0) {
    p.cancel(color.red(`Install ${missing.join(' and ')} first.`))
    process.exit(1)
  }
  // Terraform uses Application Default Credentials.
  if (
    capture('gcloud', ['auth', 'application-default', 'print-access-token']) ===
    null
  ) {
    p.log.step('Signing in to Google Cloud for Terraform...')
    runInteractive('gcloud', ['auth', 'application-default', 'login'])
  }
}

function terraformInit() {
  runInteractive('terraform', [
    `-chdir=${TF_DIR}`,
    'init',
    '-input=false',
    '-backend-config=backend.hcl',
  ])
}

async function init() {
  p.intro(color.bgCyan(color.black(' Google Cloud setup ')))
  ensureTools()

  const mode = exitIfCancelled(
    await p.select({
      message: 'Google Cloud project for staging and production',
      options: [
        { value: 'create', label: 'Create a new project' },
        { value: 'existing', label: 'Use an existing project' },
      ],
    }),
  )

  const currentProject = readTfvar('project_id')
  const project = exitIfCancelled(
    await p.text({
      message: 'Project id',
      placeholder: 'my-app-123456',
      initialValue:
        currentProject === PLACEHOLDER_PROJECT ? '' : currentProject,
      validate: (value) =>
        /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)
          ? undefined
          : '6 to 30 lowercase letters, digits or hyphens, starting with a letter.',
    }),
  )

  let billingAccount = ''
  if (mode === 'create') {
    const raw = capture('gcloud', [
      'billing',
      'accounts',
      'list',
      '--filter=open=true',
      '--format=json',
    ])
    const accounts = billingAccountsSchema.parse(JSON.parse(raw ?? '[]'))
    if (accounts.length === 0) {
      p.cancel(
        color.red(
          'No open billing account found. Create one at https://console.cloud.google.com/billing first.',
        ),
      )
      process.exit(1)
    }
    billingAccount = exitIfCancelled(
      await p.select({
        message: 'Billing account',
        options: accounts.map((account) => ({
          value: account.name.replace('billingAccounts/', ''),
          label: account.displayName,
        })),
      }),
    )
  }

  const region = exitIfCancelled(
    await p.text({ message: 'Region', initialValue: readTfvar('region') }),
  )

  const repository = exitIfCancelled(
    await p.text({
      message: 'GitHub repository allowed to deploy (owner/repo)',
      initialValue: detectGithubRepository(),
      validate: (value) =>
        /^[\w.-]+\/[\w.-]+$/.test(value) ? undefined : 'Use owner/repo.',
    }),
  )

  writeTfvar('project_id', project)
  writeTfvar('region', region)
  writeTfvar('github_repository', repository)

  p.log.step('1/4 Preparing the project and the Terraform state bucket')
  runInteractive('terraform', [
    `-chdir=${BOOTSTRAP_DIR}`,
    'init',
    '-input=false',
  ])
  runInteractive('terraform', [
    `-chdir=${BOOTSTRAP_DIR}`,
    'apply',
    `-var=project_id=${project}`,
    `-var=region=${region}`,
    `-var=create_project=${mode === 'create'}`,
    `-var=billing_account=${billingAccount}`,
  ])
  const bucket = capture('terraform', [
    `-chdir=${BOOTSTRAP_DIR}`,
    'output',
    '-raw',
    'state_bucket',
  ])
  fs.writeFileSync(BACKEND_CONFIG, `bucket = "${bucket}"\n`)

  p.log.step('2/4 Creating the secrets')
  terraformInit()
  // Services can't start until the secrets they mount have a value, so the
  // secrets are created first and filled before the full apply.
  runInteractive('terraform', [
    `-chdir=${TF_DIR}`,
    'apply',
    '-target=google_project_service.apis',
    '-target=google_secret_manager_secret.environment',
    '-target=google_secret_manager_secret.shared',
  ])

  p.log.step('3/4 Filling the secrets')
  const secretNames = terraformOutput('secret_names', secretNamesSchema)
  for (const environment of Object.keys(secretNames.environments)) {
    const file = `.env.${environment}`
    if (!fs.existsSync(path.join(ROOT, file))) {
      p.log.info(`No ${file} found, skipping ${environment}.`)
      continue
    }
    const push = exitIfCancelled(
      await p.confirm({ message: `Push ${environment} secrets from ${file}?` }),
    )
    if (push) pushSecrets(project, secretNames, environment, file)
  }

  const missing = Object.values(secretNames.required).flatMap((names) =>
    missingSecrets(project, names),
  )
  if (missing.length > 0) {
    p.note(
      [
        `These secrets need a value first: ${missing.join(', ')}`,
        '',
        `Put them in .env.staging / .env.production, then run:`,
        `  pnpm infra:secrets staging`,
        `  pnpm infra:secrets production`,
        `  pnpm infra:apply`,
        `  pnpm infra:github`,
      ].join('\n'),
      'Next steps',
    )
    p.outro('Project prepared. Services will be created by pnpm infra:apply.')
    return
  }

  p.log.step('4/4 Creating the Cloud Run services and deploy access')
  runInteractive('terraform', [`-chdir=${TF_DIR}`, 'apply'])
  await setGithubVariables()

  p.outro(
    color.green(
      'Done. Run "Deploy Staging" or "Deploy Production" from the GitHub Actions tab.',
    ),
  )
}

async function secrets(environment: string, file: string | undefined) {
  p.intro(color.bgCyan(color.black(' Secrets ')))
  ensureTools()
  const secretNames = terraformOutput('secret_names', secretNamesSchema)
  const defaultFile = environment === 'dev' ? '.env' : `.env.${environment}`
  pushSecrets(projectId(), secretNames, environment, file ?? defaultFile)
  p.outro('Done.')
}

function apply() {
  ensureTools()
  projectId()
  if (!fs.existsSync(BACKEND_CONFIG)) {
    p.cancel(color.red(`Run ${color.cyan('pnpm infra:init')} first.`))
    process.exit(1)
  }
  terraformInit()
  runInteractive('terraform', [`-chdir=${TF_DIR}`, 'apply'])
}

const program = new Command()
  .name('infra')
  .description('Google Cloud setup with Terraform (infra/terraform)')

program
  .command('init')
  .description(
    'Create or prepare the project, the secrets, the Cloud Run services and deploy access',
  )
  .action(init)

program
  .command('secrets')
  .description(
    'Push values from .env.<environment> to Secret Manager ("dev" uploads .env as a whole)',
  )
  .argument('<environment>', 'staging, production or dev')
  .argument('[file]', 'env file to read')
  .action(secrets)

program
  .command('apply')
  .description('Apply infra/terraform after changing it')
  .action(apply)

program
  .command('github')
  .description('Set the GitHub repository variables the deploy workflows read')
  .action(setGithubVariables)

program.parseAsync().catch((error: Error) => {
  p.cancel(color.red(`Unexpected error: ${error.message}`))
  process.exit(1)
})
