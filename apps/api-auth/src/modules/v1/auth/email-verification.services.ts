import { db } from '@app/database'
import { createHash, randomInt } from 'crypto'

const VERIFICATION_CODE_EXPIRY_MINUTES = 15
const VERIFICATION_CODE_MIN = 100_000
const VERIFICATION_CODE_MAX = 999_999
const MAX_VERIFICATION_ATTEMPTS = 5

function hashVerificationCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * 6-digit email-confirmation code. Only the hash is stored.
 * Invalidates any prior unconsumed code for this user, so a resend always
 * leaves exactly one code usable.
 */
export const createEmailVerificationCode = async ({
  userId,
  email,
}: {
  userId: string
  email: string
}): Promise<string> => {
  const code = String(
    randomInt(VERIFICATION_CODE_MIN, VERIFICATION_CODE_MAX + 1),
  )
  const codeHash = hashVerificationCode(code)
  const expiresAt = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000,
  )

  await db.$transaction(async (tx) => {
    await tx.emailVerificationCode.updateMany({
      where: {
        userId,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    })

    await tx.emailVerificationCode.create({
      data: {
        userId,
        email,
        codeHash,
        expiresAt,
      },
    })
  })

  return code
}

export type ConsumeEmailVerificationCodeResult =
  | { status: 'ok'; userId: string }
  | { status: 'invalid' }
  | { status: 'too_many_attempts' }

/**
 * Checks a submitted code and, on success, marks both the code consumed and the
 * user's email verified in one transaction.
 *
 * A wrong code burns an attempt against the outstanding code; once the limit is
 * reached the code is consumed outright, so brute force costs a new email round
 * trip every MAX_VERIFICATION_ATTEMPTS guesses.
 */
export const consumeEmailVerificationCode = async ({
  email,
  code,
}: {
  email: string
  code: string
}): Promise<ConsumeEmailVerificationCodeResult> => {
  const codeHash = hashVerificationCode(code.trim())

  return db.$transaction(async (tx) => {
    const outstanding = await tx.emailVerificationCode.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!outstanding) return { status: 'invalid' }

    if (outstanding.codeHash !== codeHash) {
      const attempts = outstanding.attempts + 1
      const exhausted = attempts >= MAX_VERIFICATION_ATTEMPTS

      await tx.emailVerificationCode.update({
        where: { id: outstanding.id },
        data: {
          attempts,
          consumedAt: exhausted ? new Date() : null,
        },
      })

      return exhausted ? { status: 'too_many_attempts' } : { status: 'invalid' }
    }

    const verifiedAt = new Date()

    await tx.emailVerificationCode.update({
      where: { id: outstanding.id },
      data: { consumedAt: verifiedAt },
    })

    await tx.user.update({
      where: { id: outstanding.userId },
      data: { emailVerified: verifiedAt },
    })

    return { status: 'ok', userId: outstanding.userId }
  })
}
