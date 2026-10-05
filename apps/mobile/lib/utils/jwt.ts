/**
 * Decodes a base64url or base64 string safely across React Native, Hermes, and Web environments.
 */
function base64Decode(str: string): string {
  // Convert base64url to standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if necessary
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  if (typeof atob === 'function') {
    return atob(base64);
  }

  // Fallback if atob is not defined
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < base64.length; i++) {
    const char = base64.charAt(i);
    const index = chars.indexOf(char);
    if (index === -1) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

export type JWTPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
};

/**
 * Safely decodes a JWT payload without cryptographic verification.
 * Returns null if the token is null, undefined, or malformed.
 */
export function decodeJWTPayload(token: string | null | undefined): JWTPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const decodedStr = base64Decode(parts[1]);
    return JSON.parse(decodedStr) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired based on its `exp` claim.
 *
 * @param token The JWT string to evaluate
 * @param bufferSeconds Optional safety margin in seconds (default 30s)
 * @returns `true` if token is expired, null, or malformed; `false` if still valid.
 */
export function isTokenExpired(token: string | null | undefined, bufferSeconds = 30): boolean {
  const payload = decodeJWTPayload(token);
  if (!payload) {
    return true;
  }

  // If there is no exp claim, consider valid
  if (typeof payload.exp !== 'number') {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime + bufferSeconds >= payload.exp;
}
