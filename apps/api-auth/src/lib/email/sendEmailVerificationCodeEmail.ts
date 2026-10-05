import { brand } from '@app/common'
import { randomUUID } from 'crypto'

import { escapeHtml, sendEmail } from './sendEmail'

export async function sendEmailVerificationCodeEmail({
  to,
  code,
  idempotencyId,
}: {
  to: string
  code: string
  idempotencyId: string
}): Promise<void> {
  const name = brand.displayName

  const intro = `Welcome to ${name}! Confirm your email address to finish creating your account.`
  const instructions =
    'Enter this code in the app to confirm your email address. It expires in 15 minutes.'
  const ignoreNote =
    'If you did not create an account, you can ignore this email.'

  const text = [
    intro,
    '',
    `Your verification code is: ${code}`,
    '',
    instructions,
    '',
    ignoreNote,
  ].join('\n')

  const html = `
    <p>${escapeHtml(intro)}</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${escapeHtml(code)}</p>
    <p>${escapeHtml(instructions)}</p>
    <p style="color:#666;font-size:14px">${escapeHtml(ignoreNote)}</p>
  `

  await sendEmail({
    to,
    subject: `Confirm your ${name} email address`,
    text,
    html,
    // Unique per send: the same idempotency key with a different body (new
    // code) is rejected by Resend within 24h.
    idempotencyKey: `email-verification-code/${idempotencyId}/${randomUUID()}`,
  })
}
