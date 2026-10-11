output "project_id" {
  value = local.project_id
}

output "state_bucket" {
  value = google_storage_bucket.tfstate.name
}
