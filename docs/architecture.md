# Architecture

How the starter fits together, and where to add things.

## Overview

```
apps/web  ──────────────►  (static marketing pages, no backend calls yet)

apps/mobile ──► @app/http-client ──► apps/api-auth ──► @app/database ──► CockroachDB / Postgres
                      │                    │
                      └──── @app/common ───┘         Redis (rate limiting)
                      (zod schemas shared by client and server)
```

- **`apps/web`** is a Next.js App Router site with locale-prefixed routes (`app/[locale]`), `next-intl` messages in `locales/`, and the web design system from `@app/ui`. It ships a landing page and an about page built from the primitives in `components/marketing/`.
- **`apps/mobile`** is an Expo app using `expo-router`. Routes live in `app/`: onboarding (`index`), `get-started`, the `(auth)` group, and the `(home)` tab group. `lib/contexts/AuthContext.tsx` owns the session and `app/_layout.tsx` guards navigation.
- **`apps/api-auth`** is a Fastify service. Each endpoint is a folder under `src/modules/v1/auth/` with a `router`, `controller`, `schema` and `services` file; routers are auto-loaded and the folder path is the URL.

## Authentication flow

All endpoints are under `/v1/auth`.

| Endpoint                       | Purpose                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `POST /signup`                 | Create an account and email a 6-digit verification code             |
| `POST /send-verification-code` | Resend the verification code                                        |
| `POST /verify-email`           | Confirm the code; returns the user and an access token              |
| `POST /signin`                 | Email + password; rejected until the email is verified              |
| `POST /oauth`                  | Sign in with a Google or Apple id token, or a Facebook access token |
| `POST /forgot-password`        | Email a 6-digit reset code                                          |
| `POST /reset-password`         | Set a new password with the code                                    |
| `GET /profile`                 | Current user (bearer token)                                         |
| `PATCH /profile`               | Update first name, last name and phone (bearer token)               |

Access tokens are stateless JWTs signed with `AUTH_SECRET`, valid for one day. There is no refresh token yet; the `Session` table is there for when you add revocable sessions.

## Data model

`packages/database/prisma/auth/auth.prisma` holds the only models:

- `User` — account and profile
- `OAuthAccount` — social identities linked to a user
- `Session` — reserved for server-side sessions
- `EmailVerificationCode` — hashed 6-digit codes with an attempt counter
- `PasswordResetToken` — hashed 6-digit reset codes

Prisma reads every `*.prisma` file under `prisma/`, so add a folder per domain (for example `prisma/billing/billing.prisma`).

No migrations are committed. Use `pnpm db:push` while prototyping and create your first migration with `pnpm db:migrate` when the schema settles.

## Adding a feature

1. **Model**: add or change models in `packages/database/prisma`, then `pnpm db:generate`.
2. **Contract**: add zod schemas to `packages/common/src/schemas`.
3. **API**: add a module folder in `apps/api-auth/src/modules/v1/` and register its schemas in `src/schemas.ts`. For a second service, copy `apps/api-auth` and trim it.
4. **Client**: add the route to `packages/http-client/src/clients/`.
5. **UI**: build the screen in `apps/mobile` or the page in `apps/web`, following the skills in `.agent/skills/`.
