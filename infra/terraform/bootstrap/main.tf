resource "google_project" "this" {
  count = var.create_project ? 1 : 0

  project_id      = var.project_id
  name            = var.project_name != "" ? var.project_name : var.project_id
  billing_account = var.billing_account
  org_id          = var.org_id != "" ? var.org_id : null
  folder_id       = var.folder_id != "" ? var.folder_id : null
  deletion_policy = "PREVENT"

  lifecycle {
    precondition {
      condition     = var.billing_account != ""
      error_message = "billing_account is required when create_project is true."
    }
  }
}

locals {
  project_id = var.create_project ? google_project.this[0].project_id : var.project_id
}

# The APIs Terraform itself needs before the main configuration can run.
resource "google_project_service" "base" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "serviceusage.googleapis.com",
    "storage.googleapis.com",
  ])

  project            = local.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_storage_bucket" "tfstate" {
  project                     = local.project_id
  name                        = "${local.project_id}-tfstate"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 10
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.base]
}
