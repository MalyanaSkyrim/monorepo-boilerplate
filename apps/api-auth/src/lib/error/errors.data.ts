import { ErrorCatalog } from './types/types'

export const ERROR_CATALOG: ErrorCatalog = {
  // Authentication errors
  USER_NOT_FOUND: {
    message: 'User not found',
    statusCode: 404,
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials',
    statusCode: 401,
  },
  EMAIL_ALREADY_EXISTS: {
    message: 'Email already exists',
    statusCode: 409,
  },
  USER_CREATION_FAILED: {
    message: 'Failed to create user',
    statusCode: 500,
  },
  PASSWORD_TOO_WEAK: {
    message: 'Password is too weak',
    statusCode: 400,
  },
  INVALID_EMAIL_FORMAT: {
    message: 'Invalid email format',
    statusCode: 400,
  },
  INVALID_OAUTH_TOKEN: {
    message: 'Invalid or expired OAuth token',
    statusCode: 401,
  },
  OAUTH_NOT_CONFIGURED: {
    message: 'OAuth provider is not configured on the server',
    statusCode: 503,
  },
  OAUTH_EMAIL_REQUIRED: {
    message:
      'Email is required from the social provider to create an account. Please grant email permission or use another sign-in method.',
    statusCode: 400,
  },
  EMAIL_NOT_VERIFIED: {
    message: 'Email address has not been verified',
    statusCode: 403,
  },
  EMAIL_ALREADY_VERIFIED: {
    message: 'Email address is already verified',
    statusCode: 409,
  },
  INVALID_VERIFICATION_CODE: {
    message: 'Invalid or expired verification code',
    statusCode: 400,
  },
  TOO_MANY_VERIFICATION_ATTEMPTS: {
    message: 'Too many incorrect attempts. Request a new verification code.',
    statusCode: 429,
  },

  // Validation errors
  VALIDATION_ERROR: {
    message: 'Validation error',
    statusCode: 400,
  },
  MISSING_REQUIRED_FIELD: {
    message: 'Required field is missing',
    statusCode: 400,
  },
  FIELD_TOO_SHORT: {
    message: 'Field is too short',
    statusCode: 400,
  },
  FIELD_TOO_LONG: {
    message: 'Field is too long',
    statusCode: 400,
  },
  INVALID_UUID_FORMAT: {
    message: 'Invalid UUID format',
    statusCode: 400,
  },

  // Generic errors
  TOO_MANY_REQUESTS: {
    message: 'Too many requests. Please wait a few minutes and try again.',
    statusCode: 429,
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error',
    statusCode: 500,
  },
}
