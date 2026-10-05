import { env } from './env'
import {
  createDbInstance,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from './extensions'

declare global {
  // allow global `var` declarations
  var db: ExtendedPrismaClient | undefined
}

let db: ExtendedPrismaClient

if (env.NODE_ENV === 'production') {
  db = createDbInstance()
} else {
  if (!global.db) {
    global.db = createDbInstance()
  }
  db = global.db
}

export type * from '../generated/prisma/client'
export { Prisma, PrismaClient } from '../generated/prisma/client'
export { db, env }
export { type ExtendedPrismaClient, type ExtendedTransactionClient }
