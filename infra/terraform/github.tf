# Lets GitHub Actions in var.github_repository act as the deployer account
# with short-lived tokens, so no service account key is stored in GitHub.
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }
  attribute_condition = "assertion.repository == \"${var.github_repository}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_deployer" {
  account_id   = "github-deployer"
  display_name = "GitHub Actions deployer"

  depends_on = [google_project_service.apis]
}

resource "google_service_account_iam_member" "github_deployer_wif" {
  service_account_id = google_service_account.github_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}

# What the deploy workflows do: submit builds and stream their logs, read
# secrets (DATABASE_URL for migrations, env validation) and describe services.
resource "google_project_iam_member" "github_deployer" {
  for_each = toset([
    "roles/cloudbuild.builds.editor",
    "roles/logging.viewer",
    "roles/run.viewer",
    "roles/secretmanager.secretAccessor",
    "roles/serviceusage.serviceUsageConsumer",
  ])

  project = var.project_id
  role    = each.value
  member  = google_service_account.github_deployer.member
}

resource "google_storage_bucket_iam_member" "github_deployer_source" {
  bucket = google_storage_bucket.cloud_build_source.name
  role   = "roles/storage.admin"
  member = google_service_account.github_deployer.member
}

# Needed to start builds that run as the Cloud Build account.
resource "google_service_account_iam_member" "github_deployer_acts_as_cloud_build" {
  service_account_id = google_service_account.cloud_build.name
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.github_deployer.member
}
