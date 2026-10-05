import { db } from '@app/database'
import { createHash, randomInt } from 'crypto'

const RESET_CODE_EXPIRY_MINUTES = 30
const RESET_CODE_MIN = 100_000
const RESET_CODE_MAX = 999_999

function hashResetCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * 6-digit password-reset code. Only the hash is stored.
 * Invalidates prior unconsumed codes for this user, so a resend always leaves
 * exactly one code usable.
 */
export const createPasswordResetCode = async ({
  userId,
  email,
}: {
  userId: string
  email: string
}): Promise<string> => {
  const code = String(randomInt(RESET_CODE_MIN, RESET_CODE_MAX + 1))
  const tokenHash = hashResetCode(code)
  const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000)

  await db.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    })

    await tx.passwordResetToken.create({
      data: { userId, email, tokenHash, expiresAt },
    })
  })

  return code
}

export const consumePasswordResetCode = async ({
  email,
  code,
}: {
  email: string
  code: string
}): Promise<{ userId: string } | null> => {
  const tokenHash = hashResetCode(code.trim())

  return db.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetToken) return null

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { consumedAt: new Date() },
    })

    return { userId: resetToken.userId }
  })
}
