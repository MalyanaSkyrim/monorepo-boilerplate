import { createEnv } from '@t3-oss/env-nextjs'
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({
  path: '../../.env',
})

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',

  // The marketing site has no server-side secrets yet. Add them here as you
  // introduce server actions or route handlers.
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
  client: {
    /**
     * Meta (Facebook) Pixel id. Optional on purpose: with no id set, the
     * pixel component renders nothing and no tracking script is loaded.
     */
    NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  },
})
