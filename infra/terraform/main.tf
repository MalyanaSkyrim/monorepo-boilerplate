locals {
  apis = [
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "logging.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
    "sts.googleapis.com",
  ]

  # One entry per app and environment, keyed by the Cloud Run service name.
  service_instances = {
    for pair in setproduct(keys(var.services), keys(var.environments)) :
    "${pair[0]}-${pair[1]}" => {
      app         = pair[0]
      environment = pair[1]
    }
  }
}

resource "google_project_service" "apis" {
  for_each = toset(local.apis)

  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "docker" {
  repository_id = var.artifacts_repo
  location      = var.region
  format        = "DOCKER"
  description   = "Images built by apps/*/cloudbuild.yaml"

  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = var.keep_images
    }
  }

  cleanup_policies {
    id     = "delete-older-than-30-days"
    action = "DELETE"
    condition {
      older_than = "2592000s"
    }
  }

  depends_on = [google_project_service.apis]
}

module "service" {
  source   = "./modules/cloud-run-service"
  for_each = local.service_instances

  name          = each.key
  region        = var.region
  cpu           = var.services[each.value.app].cpu
  memory        = var.services[each.value.app].memory
  port          = var.services[each.value.app].port
  public        = var.services[each.value.app].public
  min_instances = var.environments[each.value.environment].min_instances
  max_instances = var.environments[each.value.environment].max_instances

  # Production services can't be deleted by Terraform until this is turned off.
  deletion_protection = each.value.environment == "production"

  env = merge(
    { APP_ENV = each.value.environment },
    var.services[each.value.app].env,
    lookup(var.services[each.value.app].env_by_environment, each.value.environment, {}),
  )

  secret_env = merge(
    {
      for name in var.services[each.value.app].secrets :
      name => google_secret_manager_secret.environment["${name}_${var.environments[each.value.environment].secret_suffix}"].secret_id
    },
    {
      for name in var.services[each.value.app].shared_secrets :
      name => google_secret_manager_secret.shared[name].secret_id
    },
  )

  deployer_service_account_email = google_service_account.cloud_build.email

  depends_on = [google_project_service.apis]
}
