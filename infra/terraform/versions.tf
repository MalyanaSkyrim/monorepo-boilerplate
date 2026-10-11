terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  # The state bucket comes from backend.hcl, which `pnpm infra:init` writes
  # after the bootstrap step: terraform init -backend-config=backend.hcl
  backend "gcs" {
    prefix = "main"
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}
