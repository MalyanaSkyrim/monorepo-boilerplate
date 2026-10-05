/**
 * Extracts a user-friendly error message from better-fetch errors
 *
 * Handles BetterFetchError structure: { status?, statusText?, error?: { message?, code? }, message? }
 * Priority order:
 * 1. error.error?.message (API response body message)
 * 2. error.message (Error message)
 * 3. error.statusText (HTTP status text)
 * 4. Fallback message
 *
 * @param error - The error to extract message from (unknown type for safety)
 * @param fallback - Fallback message if no error message can be extracted (default: "An error occurred. Please try again.")
 * @returns A string error message
 */
interface ErrorWithBody {
  error?: { message?: string; code?: string };
  status?: number;
  statusText?: string;
  message?: string;
}

function hasErrorBody(error: unknown): error is Error & ErrorWithBody {
  return error instanceof Error;
}

export const extractErrorMessage = (
  error: unknown,
  fallback = 'An error occurred. Please try again.',
  t?: (key: any, values?: any) => string
): string => {
  if (!hasErrorBody(error)) {
    return fallback;
  }

  // BetterFetchError structure: { status, statusText, error: { message, code }, message? }
  const errorCode = error.error?.code;

  if (t && errorCode) {
    const translatedMessage = t(`auth.errors.${errorCode}`);
    // If translation doesn't exist, it might return the key itself depending on i18n config
    // But usually t returns the key if not found. We check if it's different or just rely on it.
    if (translatedMessage && translatedMessage !== `auth.errors.${errorCode}`) {
      return translatedMessage;
    }
  }

  if (error.error?.message) {
    return error.error.message;
  }

  if (error.message) {
    return error.message;
  }

  if (error.statusText) {
    return error.statusText;
  }

  return fallback;
};

/**
 * Reads the API error code (e.g. 'EMAIL_NOT_VERIFIED') off a better-fetch error.
 *
 * Lets callers branch on a specific failure without re-doing the narrowing that
 * extractErrorMessage already performs internally.
 */
export const getErrorCode = (error: unknown): string | undefined => {
  if (!hasErrorBody(error)) {
    return undefined;
  }
  return error.error?.code;
};
