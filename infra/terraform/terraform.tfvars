# Google Cloud setup for staging and production, which share one project.
# `pnpm infra:init` fills in project_id, region and github_repository.

project_id        = "your-gcp-project-id"
region            = "europe-west1"
artifacts_repo    = "app-boilerplate-docker"
github_repository = "your-github-user/app-boilerplate"

environments = {
  staging = {
    secret_suffix = "STAGING"
    max_instances = 2
  }
  production = {
    secret_suffix = "PROD"
    max_instances = 10
  }
}

# One block per app under apps/ that runs on Cloud Run. Optional secrets
# (RESEND_API_KEY, FACEBOOK_APP_SECRET, GOOGLE_OAUTH_CLIENT_IDS) can be added
# to a service's lists once they have a value in every environment.
services = {
  api-auth = {
    memory  = "512Mi"
    secrets = ["DATABASE_URL", "AUTH_SECRET", "API_KEY", "REDIS_URL"]
    env = {
      API_AUTH_PORT = "3000"
    }
    env_by_environment = {
      staging = {
        API_AUTH_URL = "https://api-auth-staging.example.com"
      }
      production = {
        API_AUTH_URL = "https://api-auth.example.com"
      }
    }
  }
  web = {
    memory = "1Gi"
  }
}
