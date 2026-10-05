# Agent Rules — app-boilerplate

Rules all AI agents must follow when working in this repository.

This repo is a reusable starter for a product with a marketing/web app, a mobile app and an authentication API. See `README.md` for the layout and `docs/architecture.md` for how the pieces fit together.

---

## Monorepo — pnpm Workspaces

This is a **pnpm monorepo** orchestrated with Turborepo. Always use the `--filter` flag to run scripts in a specific workspace instead of `cd`-ing into the package directory.

```sh
# Run a script in a specific app or package
pnpm --filter=@app/<package-or-app-name> <script>

# Examples
pnpm typecheck --filter=@app/mobile
pnpm build --filter=@app/web
pnpm test --filter=@app/common
```

Package names follow the `@app/<name>` convention and match the `name` field in each `package.json`.

| Workspace              | Name               | What it is                                         |
| ---------------------- | ------------------ | -------------------------------------------------- |
| `apps/web`             | `@app/web`         | Next.js marketing site (next-intl, Tailwind)       |
| `apps/mobile`          | `@app/mobile`      | Expo / React Native app (expo-router, NativeWind)  |
| `apps/api-auth`        | `@app/api-auth`    | Fastify authentication API                         |
| `packages/ui`          | `@app/ui`          | Web design system (Radix + Tailwind) and email kit |
| `packages/mobile-ui`   | `@app/mobile-ui`   | Mobile design system (gluestack + NativeWind)      |
| `packages/common`      | `@app/common`      | Shared zod schemas, models, brand and utilities    |
| `packages/http-client` | `@app/http-client` | Typed HTTP client for the auth API                 |
| `packages/database`    | `@app/database`    | Prisma schema and client                           |
| `packages/config`      | `@app/config`      | Shared ESLint, Prettier and TypeScript configs     |

> **Always check the `scripts` field of the relevant `package.json` before running a command** — not every package has `build`, `test`, `typecheck`, etc.

---

## Skills

Task-specific guides live in `.agent/skills/` (also exposed to Claude Code through `.claude/skills`). Read the matching skill before starting:

- `add-web-feature-guide` — features in `apps/web` and `packages/ui`
- `add-app-feature-guide` — features in `apps/mobile`
- `react-native-component-layers` — how mobile components are layered
- `react-native-forms` — forms in the mobile app
- `react-native-figma-conversion` — turning Figma designs into mobile screens

---

## TypeScript

- **Never use `any`, `unknown`, or type assertions (`as X`) unless they are the only possible solution.** Prefer:
  - Proper generics and type parameters
  - Union types and discriminated unions
  - Utility types (`Extract`, `Exclude`, `ReturnType`, `Parameters`, etc.)
  - Narrowing (type guards, `instanceof`, `in`, exhaustive `switch`)
  - Adding missing keys to source-of-truth data (e.g. adding a key to a translation JSON so `TranslationKey` auto-derives it) rather than casting around the type gap
  - `satisfies` operator instead of `as` for type validation without widening

  If `any` / `as any` / `unknown` genuinely cannot be avoided, add a comment explaining **why** no typed alternative exists.

- **Translation keys** — never cast `t('some.key' as any)`. Instead add the missing key to every locale file (`en.json`, `fr.json`, and `ar.json` on mobile) so `TranslationKey` is derived automatically from the JSON shape.

- **Dynamic template literal keys** (a key built from a prefix and a runtime value) — narrow them with a typed helper or an `Extract` over `TranslationKey` restricted to that prefix, not `as any`.

---

## Shared Contracts

- API request and response shapes are zod schemas in `packages/common/src/schemas`. The auth API, the HTTP client and the mobile app all import them from there. Change the schema first, then the callers.
- Product naming lives in `packages/common/src/brand.ts`. Never hardcode the product name in UI copy or emails; read `brand.displayName`.
- Environment variables are declared once in the root `.env.example` and validated per app in its `env.ts`. When you add a variable, update both.

---

## Database & Migrations

- **Never create, edit, or delete database migrations.**
- Do not run `prisma migrate dev`, `prisma migrate create`, or manually create/modify SQL migration files under `prisma/migrations/`.
- You may update Prisma schema files (`*.prisma`) and run `pnpm --filter=@app/database db:generate` to regenerate the Prisma client, but database migrations must be handled exclusively by the user/developer.
