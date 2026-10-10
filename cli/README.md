# create-monorepo-boilerplate

Create a new app or SaaS monorepo (Next.js web app, Expo mobile app, Fastify auth API, Prisma, Turborepo) from [monorepo-boilerplate](https://github.com/MalyanaSkyrim/monorepo-boilerplate).

```sh
npx create-monorepo-boilerplate my-app
# or
pnpm create monorepo-boilerplate my-app
npm create monorepo-boilerplate@latest my-app
```

The CLI downloads the latest template from GitHub, so new projects always start from the current `main` branch. It then:

- renames the project from `my-app`: root package name, display name (`My App`), workspace scope (`@my-app/*`), mobile bundle id (`com.example.myapp`), Expo slug and scheme, Docker container names and local database names (`my_app_dev`, `my_app_test`);
- asks what you are building and keeps only those apps: **SaaS web** (auth API + web app), **Mobile app** (auth API + mobile app), **SaaS web + mobile** (everything), or **Custom**, a checklist of each app. The auth API is always included because the other apps sign in through it. Left-out apps are removed with their shared packages, skills, docs, CI and deploy jobs and `.env` sections;
- checks the requirements: the Node version the template asks for (`.nvmrc` or `engines.node`), pnpm, git, and that Docker is installed and running (it waits for you to start Docker if it is not);
- creates `.env` from `.env.example` with a random `AUTH_SECRET` and `API_KEY`;
- checks every local port the project uses (the ports published in `docker-compose.yml`, the auth API, the web app and Metro). When one is taken it suggests the next free port, asks you to confirm or type another, and writes your choice into `docker-compose.yml`, `.env`, `.env.example` and the app scripts;
- runs `git init` and `pnpm install`, generates the Prisma client, then makes an initial commit;
- starts every service in `docker-compose.yml` (`docker compose up -d`), waits for their ports, creates the database schema (`pnpm db:push`, `pnpm db:push:test`) and seeds the demo user.

Anything that cannot run (no Docker, a failed step) is skipped with the command to run later, and the project is still created.

## Options

| Option                  | Default                              | What it does                                           |
| ----------------------- | ------------------------------------ | ------------------------------------------------------ |
| `--display-name <name>` | Title case of the project name       | Product name shown in the apps, emails and docs        |
| `--scope <scope>`       | The project name                     | Workspace package scope, without `@`                   |
| `--bundle-id <id>`      | `com.example.<name>`                 | iOS and Android bundle identifier                      |
| `--template <repo/dir>` | `MalyanaSkyrim/monorepo-boilerplate` | GitHub `owner/repo`, or a local directory              |
| `--ref <ref>`           | `main`                               | Branch, tag or commit of the template                  |
| `--preset <name>`       | Asks, or `full` with `--yes`         | `saas`, `mobile` or `full`                             |
| `--apps <list>`         |                                      | Comma-separated apps instead of a preset: `web,mobile` |
| `--no-install`          |                                      | Skip `pnpm install`                                    |
| `--no-git`              |                                      | Skip `git init` and the initial commit                 |
| `--no-services`         |                                      | Do not start Docker services or set up the database    |
| `--skip-checks`         |                                      | Continue when the Node version is too old              |
| `-y, --yes`             |                                      | Use defaults for anything not given, no prompts        |

```sh
npx create-monorepo-boilerplate acme --display-name "Acme Cloud" --scope acme --bundle-id com.acme.app
```

The CLI itself runs on Node 20 or later and needs `tar` or `git` to download the template. When your Node version is older than the template needs, it asks before continuing; with `--yes` it stops unless you pass `--skip-checks`.

## Develop and publish

The CLI is `index.mjs` plus the helpers in `lib/`; its only dependency is `@clack/prompts`. The apps and presets it offers come from `boilerplate.json` at the root of the template, so adding an app to the starter (with the folders, packages and lines to remove when it is left out) needs no new CLI release. It lives in `cli/` at the root of the boilerplate repo, outside the pnpm workspaces, and is removed from generated projects.

```sh
cd cli
npm install
node --test                                    # unit tests
node index.mjs ../../try-it --template .. --no-install   # scaffold from your local checkout
npm pack --dry-run                             # check what gets published
```

Publish a new version:

```sh
cd cli
npm login
npm version patch        # or minor / major
npm publish --access public
```

Template changes do not need a new CLI release: the CLI always downloads the template from GitHub. Publish only when `index.mjs` changes.
