# App Boilerplate

A monorepo starter for building an app or a SaaS: a Next.js web app, an Expo mobile app, and a Fastify authentication API that share one design system, one set of typed contracts and one Prisma schema.

Everything product-specific is a placeholder. Search for `TODO` and for `example.com` to find what to replace.

## Start a new project

```sh
npx create-monorepo-boilerplate my-app
```

This asks which apps you want (SaaS web, mobile, both, or a custom pick), downloads the latest version of this repo, keeps only those apps, and renames the project, display name, `@app/*` package scope and mobile bundle id from `my-app`. It checks Node, pnpm and Docker, moves any local port that is already taken, creates `.env`, runs `git init` and `pnpm install`, then starts the `docker-compose.yml` services and creates and seeds the database. Run it with `--help` for the options. The CLI lives in [`cli/`](cli/README.md), which also explains how to publish it to npm.

## What is inside

```
app-boilerplate/
├── apps/
│   ├── web/              # Next.js marketing site (next-intl, Tailwind)
│   ├── mobile/           # Expo / React Native app (expo-router, NativeWind)
│   └── api-auth/         # Fastify authentication API
├── packages/
│   ├── ui/               # Web design system and email kit
│   ├── mobile-ui/        # Mobile design system
│   ├── common/           # Shared zod schemas, models, brand, utilities
│   ├── http-client/      # Typed client for the auth API
│   ├── database/         # Prisma schema and client
│   ├── notifications/    # In-app notifications and Expo push delivery
│   └── config/           # Shared ESLint, Prettier and TypeScript configs
├── infra/terraform/      # Google Cloud setup for staging and production
├── tooling/              # Bruno API collection, deploy scripts, MCP server
├── docs/                 # Architecture, push notifications and mobile deployment guides
├── .agent/               # AI agent rules and skills
└── .github/workflows/    # CI and deploy pipelines
```

Out of the box you get:

- Email + password sign-up with 6-digit email verification, sign-in, password reset, and Google / Apple / Facebook sign-in
- A mobile app with onboarding, the full auth flow, a home placeholder and a profile area (personal data, language, help, legal)
- A localized landing page and about page (English and French; the mobile app also ships Arabic)
- Rate limiting, structured logging, OpenAPI docs and typed error codes in the API
- CI (spellcheck, format, typecheck, lint, build) and manual deploy workflows for Cloud Run and TestFlight
- A Terraform setup that prepares Google Cloud for staging and production with one command

See [docs/architecture.md](docs/architecture.md) for how the pieces connect.

## Requirements

- Node.js 24.11 or newer
- pnpm 10.10 (`corepack enable`)
- Docker, for the local database and Redis
- Xcode and/or Android Studio, for the mobile app

## Getting started

```bash
pnpm install
cp .env.example .env        # then set AUTH_SECRET and API_KEY

pnpm db:start               # CockroachDB on :26259, Redis on :6381
pnpm db:push                # apply the Prisma schema
pnpm db:seed                # demo user: john.doe@example.com / password123

pnpm dev                    # web on :3003, auth API on :4000, Metro on :8083
```

- Web: http://localhost:3003
- Auth API docs (development only): http://localhost:4000/docs
- CockroachDB console: http://localhost:8084

All workspaces read the single `.env` at the repo root.

To send real verification and reset emails, set `RESEND_API_KEY` and `RESEND_FROM`. Without them sign-up still succeeds, but no code is delivered; use the seeded demo user to sign in locally.

When testing on a physical phone, run `./scripts/set-env.sh mobile` to point the `.env` URLs at your machine's LAN IP, and `./scripts/set-env.sh local` to switch back.

## Scripts

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `pnpm dev`        | Start every app in watch mode                    |
| `pnpm build`      | Build all apps and packages                      |
| `pnpm typecheck`  | Type-check the monorepo                          |
| `pnpm lint`       | Lint the monorepo                                |
| `pnpm test`       | Run tests (the API tests need the test database) |
| `pnpm spell`      | Spellcheck with cspell                           |
| `pnpm format`     | Format with Prettier                             |
| `pnpm db:start`   | Start the database and Redis containers          |
| `pnpm db:stop`    | Stop them                                        |
| `pnpm db:push`    | Push the Prisma schema to the database           |
| `pnpm db:migrate` | Create and apply a migration                     |
| `pnpm db:seed`    | Seed the demo user                               |
| `pnpm db:studio`  | Open Prisma Studio                               |

Run a script in one workspace with `pnpm --filter=@app/<name> <script>`.

## Make it yours

1. **Name and brand**: the CLI sets these for you. Otherwise edit `packages/common/src/brand.ts`, then replace `App Boilerplate` in `apps/web/locales/*.json`, `packages/ui/src/emails/theme.ts` and `.env`.
2. **Package scope**: packages are published under `@app/*` (the CLI renames it). Keep it, or search and replace `@app/` across the repo.
3. **Mobile identifiers**: set `APP_BUNDLE_ID` and `EXPO_PUBLIC_APP_NAME`, run `eas init` and set `EAS_PROJECT_ID`.
4. **Icons and artwork**: replace the images in `apps/mobile/assets/` (app icon, splash, onboarding illustrations, get-started background) and the `AppLogo` components in `packages/ui` and `packages/mobile-ui`.
5. **Copy**: rewrite the landing page text in `apps/web/locales/` and the mobile strings in `apps/mobile/src/lib/i18n/messages/`.
6. **Legal**: the privacy policy and terms screens in the mobile app contain placeholder text.
7. **Home screen**: `apps/mobile/app/(home)/index.tsx` is a placeholder for your first feature.
8. **Social sign-in**: fill in the Google, Apple and Facebook values in `.env`. Each provider stays disabled until configured. See `apps/api-auth/README.md` for Sign in with Apple on Android.

## Deployment

The deploy workflows are manual (`workflow_dispatch`) so a fresh clone does not fail on push.

- **Web and API** run on Google Cloud Run, with staging and production in one Google Cloud project. Set it up once with Terraform:

  ```bash
  gcloud auth application-default login
  pnpm infra:init
  ```

  This creates (or prepares) the project, the image registry, the secrets, the `<app>-staging` and `<app>-production` services and keyless deploy access for GitHub Actions, then sets the repository variables the workflows read. Put each environment's values in `.env.staging` and `.env.production` first so it can push them to Secret Manager. See [infra/terraform/README.md](infra/terraform/README.md).

- Service settings (CPU, memory, env vars, which secrets each service mounts) live in `infra/terraform/terraform.tfvars`. Change them there and run `pnpm infra:apply`. Each deploy validates the service's env against the app's `env.ts` before building.
- Database migrations run in the deploy workflow once `packages/database/prisma/migrations` exists. It reads the `DATABASE_URL_STAGING` and `DATABASE_URL_PROD` secrets from Secret Manager.
- The mobile job reads `GOOGLE_OAUTH_CLIENT_IDS` from Secret Manager (web, Android, iOS client ids, comma-separated) and the Apple and Fastlane values from GitHub secrets.
- **Mobile (iOS)** ships to TestFlight with Fastlane. Follow [docs/mobile-deployment.md](docs/mobile-deployment.md).

The local database is CockroachDB. The Prisma datasource provider is `cockroachdb`; switch it to `postgresql` in `packages/database/prisma/schema.prisma` if you prefer plain Postgres.

## Working with AI agents

- `AGENTS.md` holds the repo rules. `CLAUDE.md` imports it for Claude Code.
- `.agent/skills/` holds task guides (web features, mobile features, forms, component layers, Figma conversion). They are linked into `.claude/skills`.
- `.mcp.json` registers the Gemini image MCP server in `tooling/gemini-image-mcp` (needs `GEMINI_API_KEY`).
