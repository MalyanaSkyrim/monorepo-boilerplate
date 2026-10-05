import { db } from '@app/database'
import type { User } from '@app/database'

import { generateUserTokens } from '../../../../lib/auth/jwt'
import {
  verifyAppleIdToken,
  verifyFacebookAccessToken,
  verifyGoogleIdToken,
  type VerifiedOAuthProfile,
} from '../../../../lib/auth/oauth/verify'
import {
  InvalidOAuthTokenError,
  OAuthEmailRequiredError,
} from '../../../../lib/error'
import type { UserOAuthInput } from './oauth.schema'

const PROVIDER_DB = {
  google: 'GOOGLE',
  apple: 'APPLE',
  facebook: 'FACEBOOK',
} as const

export async function resolveUserFromOAuth(
  body: UserOAuthInput,
): Promise<{ user: User; accessToken: string }> {
  const providerKey = body.provider
  const providerDb = PROVIDER_DB[providerKey]

  const profile = await verifyProviderToken(body)

  const existingLink = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: providerDb,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  })

  if (existingLink !== null) {
    const { accessToken } = generateUserTokens(
      existingLink.user.id,
      existingLink.user.email,
    )
    return { user: existingLink.user, accessToken }
  }

  if (providerKey === 'google' && !profile.emailVerified) {
    throw new InvalidOAuthTokenError({
      message: 'Google account email is not verified.',
    })
  }

  if (profile.email === null) {
    throw new OAuthEmailRequiredError()
  }

  const signupEmail = profile.email

  const userByEmail = await db.user.findFirst({
    where: {
      email: { equals: signupEmail, mode: 'insensitive' },
    },
  })

  if (userByEmail !== null) {
    await db.oAuthAccount.create({
      data: {
        userId: userByEmail.id,
        provider: providerDb,
        providerAccountId: profile.providerAccountId,
      },
    })
    const { accessToken } = generateUserTokens(
      userByEmail.id,
      userByEmail.email,
    )
    return { user: userByEmail, accessToken }
  }

  const created = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: signupEmail,
        password: null,
        firstName: profile.firstName,
        lastName: profile.lastName,
        // The provider already proved ownership of this address (Google
        // profiles with an unverified email are rejected above), so there is
        // nothing for the user to confirm.
        emailVerified: new Date(),
      },
    })
    await tx.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: providerDb,
        providerAccountId: profile.providerAccountId,
      },
    })
    return user
  })

  const { accessToken } = generateUserTokens(created.id, created.email)
  return { user: created, accessToken }
}

async function verifyProviderToken(
  body: UserOAuthInput,
): Promise<VerifiedOAuthProfile> {
  if (body.provider === 'google') {
    return verifyGoogleIdToken(body.idToken)
  }
  if (body.provider === 'apple') {
    return verifyAppleIdToken(body.idToken)
  }
  return verifyFacebookAccessToken(body.accessToken)
}
