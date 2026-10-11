# Google Cloud with Terraform

This folder sets up everything the deploy workflows need on Google Cloud. Staging and production share one project: each app runs as `<app>-staging` and `<app>-production` on Cloud Run, and per-environment secrets end in `_STAGING` or `_PROD`.

Terraform owns the infrastructure. Cloud Build (`apps/*/cloudbuild.yaml`, started by the deploy workflows) only builds images and rolls them out.

## Set it up

You need [Terraform](https://developer.hashicorp.com/terraform/install) 1.5+, the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and, to set the GitHub variables for you, the [gh CLI](https://cli.github.com/).

1. Put each environment's values in `.env.staging` and `.env.production` at the repo root (same keys as `.env.example`, gitignored). At least `DATABASE_URL` and `REDIS_URL` are needed. `AUTH_SECRET` and `API_KEY` are generated when left empty.
2. Run:

   ```bash
   gcloud auth application-default login
   pnpm infra:init
   ```

   It asks whether to create a new project (and which billing account) or use an existing one, the region and the GitHub repository, then:
   1. creates or prepares the project and a bucket for the Terraform state (`bootstrap/`),
   2. creates the secrets,
   3. pushes the values from `.env.staging` and `.env.production`,
   4. creates the Cloud Run services and deploy access, and sets the GitHub repository variables.

   Terraform shows a plan and asks for confirmation before each apply.

3. Commit `infra/terraform/terraform.tfvars`, `infra/terraform/backend.hcl` and the `.terraform.lock.hcl` files it wrote.
4. Run "Deploy Staging" or "Deploy Production" from the GitHub Actions tab. Until the first deploy, each service shows Google's placeholder page.

If a required secret is still empty, `infra:init` stops after step 3 and prints what to run next:

```bash
pnpm infra:secrets staging      # reads .env.staging
pnpm infra:secrets production   # reads .env.production
pnpm infra:apply
pnpm infra:github
```

`pnpm infra:secrets dev` uploads your local `.env` as `DEV_ENVIRONMENT_VARIABLES`, which teammates fetch with `pnpm env:pull`.

## What it creates

| File                         | Resources                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap/`                 | The project (optional, with its billing account) and the `<project>-tfstate` bucket. Local state, run once.                                                                     |
| `main.tf`                    | Required APIs, the Artifact Registry repository (keeps the last 20 images, deletes the rest after 30 days), and one Cloud Run service per app and environment.                  |
| `secrets.tf`                 | Secret Manager secrets, without values: `environment_secrets` once per environment, `shared_secrets` once.                                                                      |
| `cloudbuild.tf`              | The `cloud-build` service account builds run as, and the bucket `gcloud builds submit` uploads source to.                                                                       |
| `github.tf`                  | Workload Identity Federation for GitHub Actions in `github_repository` only, and the `github-deployer` service account the workflows act as. No key is stored in GitHub.        |
| `modules/cloud-run-service/` | A service with its own runtime service account, which can read only the secrets that service mounts. Public when `public = true`. Production services have deletion protection. |

The deploy workflows read these repository variables: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_ARTIFACTS_REPO`, `GCP_WIF_PROVIDER`, `GCP_DEPLOYER_SA`, `GCP_BUILD_SA`. `pnpm infra:github` sets them from the Terraform outputs.

## Changing things

Edit `terraform.tfvars`, then run `pnpm infra:apply`.

- **Env vars:** `env` applies to every environment, `env_by_environment` to one. Set `API_AUTH_URL` to each environment's real URL (`terraform output service_urls` lists the Cloud Run ones).
- **Secrets:** to mount an optional secret such as `RESEND_API_KEY` or `GOOGLE_OAUTH_CLIENT_IDS`, give it a value in every environment with `pnpm infra:secrets`, then add it to the service's `secrets` (or `shared_secrets`) list. A service can't start while a secret it mounts has no value.
- **A new app:** add a block to `services`, a `Dockerfile` and `cloudbuild.yaml` in `apps/<app>`, and a `- service: <app>` entry in both deploy workflows.
- **A new environment:** add it to `environments`. It gets its own services and secrets.

Secret values never go through Terraform, so they are not in the state. The image a service runs is also left to Cloud Build: Terraform ignores it after the first apply.

## What stays manual

- The billing account.
- Google OAuth client ids and the consent screen (Google Cloud console, APIs and Services).
- Custom domains: map them in the Cloud Run console, or add a `google_cloud_run_domain_mapping`, and create the DNS records at your registrar.
- Apple, Fastlane and EAS values for the mobile job, which are GitHub secrets.

The database and Redis are not created here: `DATABASE_URL` and `REDIS_URL` point to any hosted CockroachDB / Postgres and Redis (for example CockroachDB Cloud or Neon, and Upstash). The deploy workflow runs migrations from GitHub Actions, so the database must accept connections from there.

## Running Terraform yourself

```bash
cd infra/terraform
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```
