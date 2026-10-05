import { EmailButton } from '../primitives/EmailButton'
import { EmailHero } from '../primitives/EmailHero'
import { EmailInfoBox } from '../primitives/EmailInfoBox'
import { EmailLayout } from '../primitives/EmailLayout'
import { EmailLinkFallback } from '../primitives/EmailLinkFallback'
import { EmailSection } from '../primitives/EmailSection'
import { EmailStrong, EmailText } from '../primitives/EmailText'
import { type EmailContent, renderEmailHtml } from '../render'
import { emailBrand } from '../theme'

export type TeamInviteEmailProps = {
  /** Organization name, or the platform name for system-level invites. */
  entityName: string
  roleName: string
  acceptUrl: string
  /** Already formatted, e.g. "October 5, 2026". */
  expiresOn: string
}

const subjectFor = (entityName: string) =>
  `You're invited to join ${entityName}`

/** Invites a team member to the admin platform or to an organization. */
export function TeamInviteEmail({
  entityName,
  roleName,
  acceptUrl,
  expiresOn,
}: TeamInviteEmailProps) {
  return (
    <EmailLayout
      lang="en"
      title={subjectFor(entityName)}
      preheader={`Accept your invitation to join ${entityName} as ${roleName} before ${expiresOn}.`}
      footerNote={`You are receiving this email because you were invited to join ${entityName} on ${emailBrand.name}.`}>
      <EmailHero
        eyebrow="Invitation"
        title={`Join ${entityName}`}
        subtitle={`Your team is waiting for you on ${emailBrand.name}.`}
      />
      <EmailSection>
        <EmailText>
          You have been invited to join <EmailStrong>{entityName}</EmailStrong>{' '}
          as <EmailStrong>{roleName}</EmailStrong>. Accept the invitation to set
          up your account.
        </EmailText>
        <EmailInfoBox
          rows={[
            { label: 'Role', value: roleName },
            { label: 'Invitation expires', value: expiresOn },
          ]}
        />
        <EmailButton href={acceptUrl}>Accept invitation</EmailButton>
        <EmailLinkFallback
          label="Or paste this link into your browser:"
          href={acceptUrl}
        />
        <EmailText variant="note">
          If you did not expect this email, you can ignore it.
        </EmailText>
      </EmailSection>
    </EmailLayout>
  )
}

export async function buildTeamInviteEmail(
  props: TeamInviteEmailProps,
): Promise<EmailContent> {
  return {
    subject: subjectFor(props.entityName),
    html: await renderEmailHtml(<TeamInviteEmail {...props} />),
    text: [
      `You have been invited to join ${props.entityName} as ${props.roleName}.`,
      '',
      `Accept your invitation before ${props.expiresOn}:`,
      props.acceptUrl,
      '',
      'If you did not expect this email, you can ignore it.',
    ].join('\n'),
  }
}
