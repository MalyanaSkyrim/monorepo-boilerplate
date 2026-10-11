terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  # Local state on purpose: this step creates the bucket the main state lives
  # in. Losing this file only means re-importing the bucket and project.
}

provider "google" {
  region = var.region
}
