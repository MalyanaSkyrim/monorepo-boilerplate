locals {
  # DATABASE_URL_STAGING, DATABASE_URL_PROD, ...
  environment_secrets = {
    for pair in setproduct(keys(var.environments), var.environment_secrets) :
    "${pair[1]}_${var.environments[pair[0]].secret_suffix}" => {
      name        = pair[1]
      environment = pair[0]
    }
  }
}

# Terraform creates the secrets but never their values, so no secret ends up
# in the state. Add values with `pnpm infra:secrets <environment>`.
resource "google_secret_manager_secret" "environment" {
  for_each = local.environment_secrets

  secret_id = each.key
  labels = {
    environment = each.value.environment
  }

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret" "shared" {
  for_each = toset(var.shared_secrets)

  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}
