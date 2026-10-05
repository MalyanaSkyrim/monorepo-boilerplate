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
- creates `.env` from `.env.example`;
- runs `git init` and `pnpm install`, then makes an initial commit.

## Options

| Option                  | Default                              | What it does                                    |
| ----------------------- | ------------------------------------ | ----------------------------------------------- |
| `--display-name <name>` | Title case of the project name       | Product name shown in the apps, emails and docs |
| `--scope <scope>`       | The project name                     | Workspace package scope, without `@`            |
| `--bundle-id <id>`      | `com.example.<name>`                 | iOS and Android bundle identifier               |
| `--template <repo/dir>` | `MalyanaSkyrim/monorepo-boilerplate` | GitHub `owner/repo`, or a local directory       |
| `--ref <ref>`           | `main`                               | Branch, tag or commit of the template           |
| `--no-install`          |                                      | Skip `pnpm install`                             |
| `--no-git`              |                                      | Skip `git init` and the initial commit          |
| `-y, --yes`             |                                      | Use defaults for anything not given, no prompts |

```sh
npx create-monorepo-boilerplate acme --display-name "Acme Cloud" --scope acme --bundle-id com.acme.app
```

Requirements: Node 20 or later, `tar` or `git` to download the template, and pnpm (`corepack enable`) to install. The generated project itself targets Node 24.

## Develop and publish

The CLI is a single dependency-free file, `index.mjs`. It lives in `cli/` at the root of the boilerplate repo, outside the pnpm workspaces, and is removed from generated projects.

```sh
cd cli
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
