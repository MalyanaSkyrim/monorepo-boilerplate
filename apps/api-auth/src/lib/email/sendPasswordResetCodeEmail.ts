import { brand } from '@app/common'
import { randomUUID } from 'crypto'

import { escapeHtml, sendEmail } from './sendEmail'

export async function sendPasswordResetCodeEmail({
  to,
  code,
  idempotencyId,
}: {
  to: string
  code: string
  idempotencyId: string
}): Promise<void> {
  const name = brand.displayName

  const intro = `We received a request to reset your ${name} password.`
  const instructions =
    'Enter this code in the app to choose a new password. It expires in 30 minutes.'
  const ignoreNote =
    'If you did not request a password reset, you can ignore this email.'

  const text = [
    intro,
    '',
    `Your reset code is: ${code}`,
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
    subject: `Reset your ${name} password`,
    text,
    html,
    // Unique per send: the same idempotency key with a different body (new
    // code) is rejected by Resend within 24h.
    idempotencyKey: `password-reset-code/${idempotencyId}/${randomUUID()}`,
  })
}
