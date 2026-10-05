import { describe, expect, it } from 'vitest';
import { decodeJWTPayload, isTokenExpired } from './jwt';

// Helper to create mock JWTs with given payload
function createMockJWT(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mockSignature`;
}

describe('jwt utility', () => {
  it('returns true for null or empty tokens', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired('')).toBe(true);
    expect(isTokenExpired(undefined)).toBe(true);
  });

  it('returns true for malformed tokens', () => {
    expect(isTokenExpired('not.a.valid.jwt')).toBe(true);
    expect(isTokenExpired('random_string')).toBe(true);
  });

  it('returns true for expired tokens', () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 300; // Expired 5 mins ago
    const token = createMockJWT({ exp: expiredExp, sub: 'user_123' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns false for unexpired tokens', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // Expiring in 1 hour
    const token = createMockJWT({ exp: futureExp, sub: 'user_123' });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('correctly decodes payload data', () => {
    const token = createMockJWT({ sub: 'user_123', email: 'test@example.com' });
    const payload = decodeJWTPayload(token);
    expect(payload?.sub).toBe('user_123');
    expect(payload?.email).toBe('test@example.com');
  });
});
