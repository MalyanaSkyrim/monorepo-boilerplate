variable "project_id" {
  description = "Google Cloud project id, existing or to create."
  type        = string
}

variable "create_project" {
  description = "Create the project. Leave false to use an existing one."
  type        = bool
  default     = false
}

variable "project_name" {
  description = "Display name of a created project. Defaults to project_id."
  type        = string
  default     = ""
}

variable "billing_account" {
  description = "Billing account id (XXXXXX-XXXXXX-XXXXXX) linked to a created project."
  type        = string
  default     = ""
}

variable "org_id" {
  description = "Organization to create the project in. Leave empty for an account without an organization."
  type        = string
  default     = ""
}

variable "folder_id" {
  description = "Folder to create the project in, instead of org_id."
  type        = string
  default     = ""
}

variable "region" {
  description = "Location of the Terraform state bucket."
  type        = string
  default     = "europe-west1"
}
