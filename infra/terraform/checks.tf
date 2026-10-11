# Fails the plan early with a readable message instead of an index error.
resource "terraform_data" "validate_services" {
  lifecycle {
    precondition {
      condition = alltrue(flatten([
        for app, service in var.services : [
          for name in service.secrets : contains(var.environment_secrets, name)
        ]
      ]))
      error_message = "Every name in services.*.secrets must be listed in environment_secrets."
    }

    precondition {
      condition = alltrue(flatten([
        for app, service in var.services : [
          for name in service.shared_secrets : contains(var.shared_secrets, name)
        ]
      ]))
      error_message = "Every name in services.*.shared_secrets must be listed in shared_secrets."
    }
  }
}
