<!-- cspell:ignore letterboxed colour -->

# Tooling

This directory contains development and testing tools for the App Boilerplate project.

## Bruno API Collections

The `bruno/` directory contains API testing collections for the App Boilerplate API.

### Getting Started

1. Install [Bruno](https://www.usebruno.com/)
2. Open the collection from `bruno/api/`
3. Select your environment (Dev, Staging, or PROD)
4. Start testing!

See `bruno/api/README.md` for detailed documentation.

## Gemini Image MCP

`gemini-image-mcp/` is an MCP server (registered in the root `.mcp.json`) that lets Claude Code generate images with Gemini. It needs `GEMINI_API_KEY` in the root `.env` and writes to `generated-images/` (gitignored).

| Tool               | Purpose                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `generate_image`   | High-res raster (up to 4K). Optional exact `width`/`height`, letterboxed to fit (never cropped), and `transparent` output.               |
| `generate_logo`    | Flat, centred logo / app-icon mark: transparent 1024px master, safe-zone padding and extra `sizes`.                                      |
| `generate_svg`     | Gemini writes clean, editable SVG markup and a PNG preview is rendered alongside it.                                                     |
| `generate_favicon` | Favicon set (`favicon.ico`, `icon.svg`, `apple-icon.png`, 192/512 manifest icons) from an idea `prompt` or an existing png/svg `source`. |
| `resize_image`     | Resize an existing png/jpg/webp/svg without cropping (optional trim and padding colour).                                                 |

`generate_*` tools accept `reference_images` (repo-relative paths) for brand consistency, e.g. `apps/mobile/assets/icon.png`.

Optional env overrides: `GEMINI_IMAGE_MODEL` (default `gemini-3-pro-image`), `GEMINI_SVG_MODEL` (default `gemini-3.1-pro-preview`), `IMAGE_OUT_DIR`.

## Scripts

### Environment Management

- `env:pull` - Pull the development `.env` from Google Secret Manager. Set `PROJECT_ID` and `SECRET_NAME` at the top of `scripts/pull-env.ts` first.

### Mobile

- `deploy-mobile.sh [staging|production]` - Build the iOS app locally and upload it to TestFlight with Fastlane. See `docs/mobile-deployment.md`.

### Cloud Run

- `create-service.sh <name> [staging|production]` - One-time creation of the `<name>-<environment>` Cloud Run service for an app under `apps/` (e.g. `web`, `api-auth`). Memory, CPU and port are read from the app's `CloudBuild.yaml`. Later deploys go through the GitHub deploy workflows.

See the root `package.json` for all available scripts.
