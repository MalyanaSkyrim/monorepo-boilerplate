import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Every workspace reads the single `.env` at the repo root.
dotenv.config({ path: '../../.env' })

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seeds/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
