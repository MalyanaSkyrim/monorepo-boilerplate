import { createRemoteJWKSet, jwtVerify } from 'jose'

import { env } from '../../../env'
import {
  InvalidOAuthTokenError,
  OAuthNotConfiguredError,
} from '../../../lib/error'

export type VerifiedOAuthProfile = {
  providerAccountId: string
  email: string | null
  emailVerified: boolean
  firstName: string
  lastName: string | null
}

const googleJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

const appleJwks = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
)

function parseGoogleAudiences(): string[] {
  const raw = env.GOOGLE_OAUTH_CLIENT_IDS
  if (raw === undefined || raw.trim() === '') {
    return []
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function trimmedNonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined
  }
  const t = value.trim()
  return t.length > 0 ? t : undefined
}

/**
 * Apple identity JWT `aud` differs by platform. Set one or both in `.env`:
 * - `APPLE_SIGN_IN_IOS_BUNDLE_ID` — native iOS (bundle id).
 * - `APPLE_SIGN_IN_SERVICE_ID` — Android / Invertase web flow (Services ID).
 */
function parseAppleAudiences(): string[] {
  const ids = new Set<string>()
  const bundle = trimmedNonEmpty(env.APPLE_SIGN_IN_IOS_BUNDLE_ID)
  const service = trimmedNonEmpty(env.APPLE_SIGN_IN_SERVICE_ID)
  if (bundle !== undefined) {
    ids.add(bundle)
  }
  if (service !== undefined) {
    ids.add(service)
  }
  return [...ids]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<VerifiedOAuthProfile> {
  const audiences = parseGoogleAudiences()
  if (audiences.length === 0) {
    throw new OAuthNotConfiguredError({
      message: 'Google OAuth is not configured (GOOGLE_OAUTH_CLIENT_IDS).',
    })
  }

  try {
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: audiences,
    })

    if (!isRecord(payload)) {
      throw new InvalidOAuthTokenError({
        message: 'Invalid Google token payload.',
      })
    }

    const sub = typeof payload.sub === 'string' ? payload.sub : ''
    if (sub === '') {
      throw new InvalidOAuthTokenError({ message: 'Google token missing sub.' })
    }

    const email = typeof payload.email === 'string' ? payload.email : null
    const emailVerified = payload.email_verified === true

    const givenName =
      typeof payload.given_name === 'string' ? payload.given_name : 'User'
    const familyName =
      typeof payload.family_name === 'string' ? payload.family_name : null

    return {
      providerAccountId: sub,
      email: email === null ? null : normalizeEmail(email),
      emailVerified,
      firstName: givenName,
      lastName: familyName,
    }
  } catch (error) {
    if (error instanceof OAuthNotConfiguredError) {
      throw error
    }
    if (error instanceof InvalidOAuthTokenError) {
      throw error
    }
    throw new InvalidOAuthTokenError({
      message: 'Google ID token could not be verified.',
      meta: {
        cause: error instanceof Error ? error.message : 'unknown',
      },
    })
  }
}

export async function verifyAppleIdToken(
  idToken: string,
): Promise<VerifiedOAuthProfile> {
  const audiences = parseAppleAudiences()
  if (audiences.length === 0) {
    throw new OAuthNotConfiguredError({
      message:
        'Apple Sign In is not configured (set APPLE_SIGN_IN_IOS_BUNDLE_ID and/or APPLE_SIGN_IN_SERVICE_ID).',
    })
  }

  try {
    const { payload } = await jwtVerify(idToken, appleJwks, {
      issuer: 'https://appleid.apple.com',
      audience: audiences,
    })

    if (!isRecord(payload)) {
      throw new InvalidOAuthTokenError({
        message: 'Invalid Apple token payload.',
      })
    }

    const sub = typeof payload.sub === 'string' ? payload.sub : ''
    if (sub === '') {
      throw new InvalidOAuthTokenError({ message: 'Apple token missing sub.' })
    }

    const email = typeof payload.email === 'string' ? payload.email : null

    return {
      providerAccountId: sub,
      email: email === null ? null : normalizeEmail(email),
      emailVerified: true,
      firstName: 'User',
      lastName: null,
    }
  } catch (error) {
    if (error instanceof OAuthNotConfiguredError) {
      throw error
    }
    if (error instanceof InvalidOAuthTokenError) {
      throw error
    }
    throw new InvalidOAuthTokenError({
      message: 'Apple identity token could not be verified.',
      meta: {
        cause: error instanceof Error ? error.message : 'unknown',
      },
    })
  }
}

type FacebookDebugTokenResponse = {
  data?: {
    app_id?: string
    is_valid?: boolean
    user_id?: string
  }
}

type FacebookMeResponse = {
  id?: string
  email?: string
  first_name?: string
  last_name?: string
  error?: { message?: string }
}

export async function verifyFacebookAccessToken(
  accessToken: string,
): Promise<VerifiedOAuthProfile> {
  const appId = env.FACEBOOK_APP_ID
  const appSecret = env.FACEBOOK_APP_SECRET
  if (
    appId === undefined ||
    appSecret === undefined ||
    appId.trim() === '' ||
    appSecret.trim() === ''
  ) {
    throw new OAuthNotConfiguredError({
      message:
        'Facebook OAuth is not configured (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET).',
    })
  }

  const appAccessToken = `${appId}|${appSecret}`
  const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`

  const debugRes = await fetch(debugUrl)
  const debugJson = (await debugRes.json()) as FacebookDebugTokenResponse
  const data = debugJson.data
  if (
    data?.is_valid !== true ||
    typeof data.app_id !== 'string' ||
    data.app_id !== appId ||
    typeof data.user_id !== 'string'
  ) {
    throw new InvalidOAuthTokenError({
      message:
        'Facebook access token is invalid or does not belong to this app.',
    })
  }

  const meUrl = `https://graph.facebook.com/v21.0/me?fields=id,email,first_name,last_name&access_token=${encodeURIComponent(accessToken)}`
  const meRes = await fetch(meUrl)
  const meJson = (await meRes.json()) as FacebookMeResponse
  if (meJson.error !== undefined) {
    throw new InvalidOAuthTokenError({
      message: meJson.error.message ?? 'Facebook Graph API error.',
    })
  }

  const id = typeof meJson.id === 'string' ? meJson.id : ''
  if (id === '') {
    throw new InvalidOAuthTokenError({
      message: 'Facebook response missing id.',
    })
  }

  const email =
    typeof meJson.email === 'string' ? normalizeEmail(meJson.email) : null
  const firstName =
    typeof meJson.first_name === 'string' ? meJson.first_name : 'User'
  const lastName =
    typeof meJson.last_name === 'string' ? meJson.last_name : null

  return {
    providerAccountId: id,
    email,
    emailVerified: email !== null,
    firstName,
    lastName,
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
