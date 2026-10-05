// Email templates render to static HTML on the server. Kept out of the main
// `@app/ui` barrel, which pulls in client-only Radix components.
export { type EmailContent, renderEmailHtml } from './render'
export { type EmailLocale } from './templates/copy'
export {
  buildTeamInviteEmail,
  TeamInviteEmail,
  type TeamInviteEmailProps,
} from './templates/TeamInviteEmail'
