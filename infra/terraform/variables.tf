variable "project_id" {
  description = "Google Cloud project that holds both staging and production."
  type        = string
}

variable "region" {
  description = "Region for Cloud Run, Artifact Registry and the Cloud Build source bucket."
  type        = string
  default     = "europe-west1"
}

variable "artifacts_repo" {
  description = "Artifact Registry Docker repository the deploy workflows push to."
  type        = string
}

variable "github_repository" {
  description = "owner/repo allowed to deploy through Workload Identity Federation."
  type        = string
}

variable "keep_images" {
  description = "Number of most recent images Artifact Registry keeps per package."
  type        = number
  default     = 20
}

variable "environments" {
  description = "Deployment environments. secret_suffix is appended to per-environment secret names (DATABASE_URL_STAGING)."
  type = map(object({
    secret_suffix = string
    min_instances = optional(number, 0)
    max_instances = optional(number, 3)
  }))
}

variable "environment_secrets" {
  description = "Secrets created once per environment as <NAME>_<secret_suffix>. Values are added with `pnpm infra:secrets`, never by Terraform."
  type        = list(string)
  default = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "API_KEY",
    "REDIS_URL",
    "RESEND_API_KEY",
    "FACEBOOK_APP_SECRET",
  ]
}

variable "shared_secrets" {
  description = "Secrets shared by every environment."
  type        = list(string)
  default = [
    # Read by api-auth (optional) and by the mobile deploy job.
    "GOOGLE_OAUTH_CLIENT_IDS",
    # The team's development .env, read by `pnpm env:pull`.
    "DEV_ENVIRONMENT_VARIABLES",
  ]
}

variable "services" {
  description = "Cloud Run services, one per app under apps/. Each one is created once per environment as <app>-<environment>."
  type = map(object({
    cpu    = optional(string, "1")
    memory = optional(string, "512Mi")
    port   = optional(number, 3000)
    public = optional(bool, true)
    # Names from environment_secrets, mounted as env vars of the same name.
    # A secret needs a value before the service that mounts it can start.
    secrets = optional(list(string), [])
    # Names from shared_secrets, mounted as env vars of the same name.
    shared_secrets     = optional(list(string), [])
    env                = optional(map(string), {})
    env_by_environment = optional(map(map(string)), {})
  }))
}
