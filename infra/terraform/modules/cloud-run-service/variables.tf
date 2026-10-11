variable "name" {
  description = "Service name, <app>-<environment>."
  type        = string
}

variable "region" {
  type = string
}

variable "cpu" {
  type = string
}

variable "memory" {
  type = string
}

variable "port" {
  type = number
}

variable "public" {
  description = "Allow unauthenticated requests."
  type        = bool
}

variable "min_instances" {
  type = number
}

variable "max_instances" {
  type = number
}

variable "deletion_protection" {
  type = bool
}

variable "env" {
  description = "Plain environment variables."
  type        = map(string)
  default     = {}
}

variable "secret_env" {
  description = "Environment variable name => Secret Manager secret id, always the latest version."
  type        = map(string)
  default     = {}
}

variable "deployer_service_account_email" {
  description = "Account that rolls out new images (Cloud Build). It must be able to act as the runtime account."
  type        = string
}
