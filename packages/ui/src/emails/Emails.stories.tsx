import type { Meta, StoryObj } from '@storybook/react'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { TeamInviteEmail } from './templates/TeamInviteEmail'
import { emailBrand } from './theme'

type EmailPreviewProps = {
  email: ReactElement
  /** Viewport width of the preview, to check the layout on phones. */
  width: number
}

/**
 * Renders the email to static HTML inside an iframe, like a mail client does,
 * so Storybook's global Tailwind styles can't leak into the preview. Images are
 * served locally (Storybook `staticDirs`) so they show before they're deployed.
 */
function EmailPreview({ email, width }: EmailPreviewProps) {
  const html = renderToStaticMarkup(email).replaceAll(
    emailBrand.assetsUrl,
    '/email',
  )

  return (
    <iframe
      title="Email preview"
      srcDoc={`<!DOCTYPE html>${html}`}
      style={{
        display: 'block',
        width,
        maxWidth: '100%',
        height: 1180,
        margin: '0 auto',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
      }}
    />
  )
}

const DESKTOP = 720
const PHONE = 360

const meta: Meta<typeof EmailPreview> = {
  title: 'Emails/Templates',
  component: EmailPreview,
  parameters: { layout: 'padded' },
  argTypes: {
    email: { control: false },
    width: { control: { type: 'range', min: 320, max: 900, step: 10 } },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const TeamInvite: Story = {
  name: 'Team · invitation',
  args: {
    width: DESKTOP,
    email: (
      <TeamInviteEmail
        entityName="Acme Inc"
        roleName="Manager"
        acceptUrl="https://example.com/invite/accept?token=3f9c2a7e1b4d4c8f9a6e0d2b5c7f1a3e"
        expiresOn="October 5, 2026"
      />
    ),
  },
}

export const TeamInvitePhone: Story = {
  name: 'Team · invitation (phone)',
  args: { ...TeamInvite.args, width: PHONE },
}
