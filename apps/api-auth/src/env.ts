import { createEnv } from '@t3-oss/env-core'
import dotenv from 'dotenv'
import z from 'zod'

dotenv.config({ path: '../../.env' })

export const env = createEnv({
  /*
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',

  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    RATE_LIMIT_MAX: z.coerce.number().default(500),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000),
    API_AUTH_PORT: z.coerce.number().default(4000),
    APP_ENV: z
      .enum(['development', 'production', 'staging'])
      .default('development'),

    API_AUTH_URL: z.string().default('http://localhost:4000'),
    API_KEY: z.string(),
    REDIS_URL: z
      .string()
      .regex(/^rediss?:\/\/(.*)$/, 'Invalid Redis URL format'),
    AUTH_SECRET: z.string(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),

    /** Comma-separated Google OAuth client IDs allowed as JWT `aud` on id_token (include Web client used as `webClientId` on the mobile app; add iOS/Android if you accept those audiences). */
    GOOGLE_OAUTH_CLIENT_IDS: z.string().optional(),
    /**
     * iOS native Sign in with Apple: JWT `aud` matches the app bundle identifier (e.g. com.example.app).
     */
    APPLE_SIGN_IN_IOS_BUNDLE_ID: z.string().optional(),
    /**
     * Sign in with Apple on Android (web flow): JWT `aud` is the Apple Services ID from the developer portal, not the Android package name.
     */
    APPLE_SIGN_IN_SERVICE_ID: z.string().optional(),
    FACEBOOK_APP_ID: z.string().optional(),
    FACEBOOK_APP_SECRET: z.string().optional(),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
})
