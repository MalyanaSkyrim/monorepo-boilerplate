export interface ErrorDefinition {
  message: string
  statusCode: number
}

// Error codes
export const ERROR_CODES = [
  // Authentication errors
  'USER_NOT_FOUND',
  'INVALID_CREDENTIALS',
  'EMAIL_ALREADY_EXISTS',
  'USER_CREATION_FAILED',
  'PASSWORD_TOO_WEAK',
  'INVALID_EMAIL_FORMAT',
  'INVALID_OAUTH_TOKEN',
  'OAUTH_NOT_CONFIGURED',
  'OAUTH_EMAIL_REQUIRED',
  'EMAIL_NOT_VERIFIED',
  'EMAIL_ALREADY_VERIFIED',
  'INVALID_VERIFICATION_CODE',
  'TOO_MANY_VERIFICATION_ATTEMPTS',

  // Validation errors
  'VALIDATION_ERROR',
  'MISSING_REQUIRED_FIELD',
  'FIELD_TOO_SHORT',
  'FIELD_TOO_LONG',
  'INVALID_UUID_FORMAT',

  // Generic errors
  'TOO_MANY_REQUESTS',
  'INTERNAL_SERVER_ERROR',
] as const

export type ErrorCatalog = Partial<Record<ErrorCode, ErrorDefinition>>

export type ErrorCode = (typeof ERROR_CODES)[number]
