# Auth API

Fastify-based API server that handles authentication for the web and mobile apps.

## Features

- User authentication (signup/signin)
- Health check endpoint
- JWT token-based authentication
- OpenAPI/Swagger documentation

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The API will be available at `http://localhost:4000` (configurable via `API_AUTH_PORT`).

### Building

```bash
pnpm build
```

### Running Production Build

```bash
pnpm start
```

## API Endpoints

### Authentication

- `POST /v1/auth/signup` - Create a new user account
- `POST /v1/auth/signin` - Authenticate and get JWT token

### Health

- `GET /health` - Health check endpoint

### Sign in with Apple (Android redirect)

Invertase Sign in with Apple on Android needs a **Return URL** registered in Apple Developer (Services ID). This API exposes that URL on the same public host as the rest of api-auth:

- `GET /v1/auth/oauth/apple/android/callback` — returns **200** and minimal HTML. Apple may append query parameters (`code`, `state`, `id_token`, etc.); the app WebView intercepts them. The mobile app still completes sign-in via **`POST /v1/auth/oauth`** with `{ "provider": "apple", "idToken": "..." }` (verified with Apple JWKS on the server).

**Configure:**

1. **Apple Developer** — Services ID for Android: add **Return URLs** exactly as (production example):

   `https://<your-public-api-auth-host>/v1/auth/oauth/apple/android/callback`

   No query string in the saved Return URL string.

2. **Mobile app** (`app.config.js` / EAS) — set:

   `EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_REDIRECT_URI` to that same **https** URL.

   `EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_SERVICE_ID` must match the Services ID.

3. **api-auth** (`.env`) — set `APPLE_SIGN_IN_SERVICE_ID` to the same Services ID (JWT `aud` for Android tokens). For iOS native Sign in with Apple, set `APPLE_SIGN_IN_IOS_BUNDLE_ID` to the app bundle identifier.

### Documentation

- `GET /docs` - Swagger UI (development only)
- `GET /docs/json` - OpenAPI JSON specification

## Environment Variables

- `API_AUTH_PORT` - Port for the API server (default: 4000)
- `API_AUTH_URL` - Public base URL of this service (used when documenting redirect URLs)
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret for JWT token signing
- `APPLE_SIGN_IN_IOS_BUNDLE_ID` - Optional; iOS native Sign in with Apple JWT audience (bundle id)
- `APPLE_SIGN_IN_SERVICE_ID` - Optional; Android / web-style Sign in with Apple JWT audience (Apple Services ID)
- `GOOGLE_OAUTH_CLIENT_IDS` - Optional; comma-separated Google OAuth client IDs for id_token verification

User app env (not read by api-auth): `EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_REDIRECT_URI`, `EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_SERVICE_ID` — see **Sign in with Apple (Android redirect)** above.
