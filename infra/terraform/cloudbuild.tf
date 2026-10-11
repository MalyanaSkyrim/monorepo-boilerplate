# Cloud Build runs apps/*/cloudbuild.yaml as this account instead of the
# project's default one, so its permissions are known and minimal.
resource "google_service_account" "cloud_build" {
  account_id   = "cloud-build"
  display_name = "Cloud Build (builds images and rolls out Cloud Run)"

  depends_on = [google_project_service.apis]
}

resource "google_project_iam_member" "cloud_build" {
  for_each = toset([
    "roles/artifactregistry.writer",
    "roles/logging.logWriter",
    "roles/run.developer",
  ])

  project = var.project_id
  role    = each.value
  member  = google_service_account.cloud_build.member
}

# `gcloud builds submit` uploads the source here. This is the bucket name
# gcloud uses by default, created up front so the deployer needs no
# project-wide storage role.
resource "google_storage_bucket" "cloud_build_source" {
  name                        = "${var.project_id}_cloudbuild"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_storage_bucket_iam_member" "cloud_build_source_reader" {
  bucket = google_storage_bucket.cloud_build_source.name
  role   = "roles/storage.objectViewer"
  member = google_service_account.cloud_build.member
}
