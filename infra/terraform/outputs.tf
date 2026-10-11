output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "service_urls" {
  description = "Cloud Run URL of every service."
  value       = { for name, service in module.service : name => service.url }
}

output "secret_names" {
  description = "Secret Manager names, per environment and shared. Read by `pnpm infra:secrets`."
  value = {
    environments = {
      for environment, config in var.environments : environment => {
        for name in var.environment_secrets : name => "${name}_${config.secret_suffix}"
      }
    }
    shared = { for name in var.shared_secrets : name => name }
    # Secrets each service mounts; they need a value before that service starts.
    required = {
      for environment, config in var.environments : environment => distinct(flatten([
        for app, service in var.services : concat(
          [for name in service.secrets : "${name}_${config.secret_suffix}"],
          service.shared_secrets,
        )
      ]))
    }
  }
}

output "github_variables" {
  description = "Repository variables the deploy workflows read. `pnpm infra:init` sets them with the gh CLI."
  value = {
    GCP_PROJECT_ID     = var.project_id
    GCP_REGION         = var.region
    GCP_ARTIFACTS_REPO = google_artifact_registry_repository.docker.repository_id
    GCP_WIF_PROVIDER   = google_iam_workload_identity_pool_provider.github.name
    GCP_DEPLOYER_SA    = google_service_account.github_deployer.email
    GCP_BUILD_SA       = google_service_account.cloud_build.email
  }
}
