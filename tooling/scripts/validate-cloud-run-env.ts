import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { execSync } from 'node:child_process'
import path from 'node:path'

const APP_PATHS: Record<string, string> = {
  'api-auth': 'apps/api-auth/src/env.ts',
  web: 'apps/web/env.ts',
}

const REGION = 'europe-west1'

async function getSecretValue(
  client: SecretManagerServiceClient,
  secretName: string,
  version: string = 'latest',
) {
  try {
    const name = `projects/${process.env.PROJECT_ID}/secrets/${secretName}/versions/${version}`
    const [response] = await client.accessSecretVersion({ name })
    return response.payload?.data?.toString()
  } catch (err) {
    console.warn(
      `⚠️ Could not fetch secret ${secretName}: ${(err as Error).message}`,
    )
    return '__SECRET_REFERENCE__'
  }
}

async function main() {
  const app = process.argv[2]
  const envName = process.argv[3] // e.g. 'staging'

  if (!app || !APP_PATHS[app]) {
    console.error(
      `Usage: tsx validate-cloud-run-env.ts <app-name> <environment>`,
    )
    console.error(`Available apps: ${Object.keys(APP_PATHS).join(', ')}`)
    process.exit(1)
  }

  const serviceName = `${app}-${envName}`
  console.log(`🔍 Validating Cloud Run environment for ${serviceName}...`)

  try {
    // 1. Fetch Cloud Run service configuration
    const output = execSync(
      `gcloud run services describe ${serviceName} --region ${REGION} --format=json`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    )
    const config = JSON.parse(output)
    const envVars = config.spec.template.spec.containers[0].env || []

    const envMap: Record<string, string> = {}
    const secretClient = new SecretManagerServiceClient()

    // 2. Extract environment variables
    console.log(`📦 Found ${envVars.length} environment variables.`)

    for (const v of envVars) {
      if (v.value !== undefined) {
        envMap[v.name] = v.value
      } else if (v.valueFrom?.secretKeyRef) {
        const secretName = v.valueFrom.secretKeyRef.name
        const secretKey = v.valueFrom.secretKeyRef.key
        console.log(`🔐 Fetching secret: ${secretName} (${secretKey})...`)
        const value = await getSecretValue(secretClient, secretName, secretKey)
        envMap[v.name] = value || '__SECRET_REFERENCE__'
      }
    }

    // 3. Inject variables into process.env for validation
    // We set SKIP_ENV_VALIDATION=false to force the check
    process.env.SKIP_ENV_VALIDATION = 'false'
    Object.assign(process.env, envMap)

    // 4. Dynamically import the app's env.ts to trigger validation
    const envFilePath = path.resolve(process.cwd(), APP_PATHS[app])
    console.log(`🧪 Importing ${APP_PATHS[app]} for validation...`)

    try {
      // Clear cache if we were running multiple validations in one process (not the case here but good practice)
      await import(`${envFilePath}?update=${Date.now()}`)
      console.log('✅ Environment validation successful!')
    } catch (err: any) {
      console.error('❌ Environment validation failed!')
      if (err.flatten) {
        // Handle T3 Env / Zod errors specifically
        console.error(JSON.stringify(err.flatten().fieldErrors, null, 2))
      } else {
        console.error(err.message || err)
      }
      process.exit(1)
    }
  } catch (error: any) {
    console.error(`💥 Fatal Error: ${error.message}`)
    process.exit(1)
  }
}

main()
