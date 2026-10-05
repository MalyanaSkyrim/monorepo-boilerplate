import Redis from 'ioredis'

import { env } from '../env'

const REDIS_MAX_RETRIES = 10

const parseRedisUrl = (url: string) => {
  const protocol = url.match(/^(rediss?):\/\//)?.[1]
  const withoutProtocol = url.replace(/^rediss?:\/\//, '')

  const atIndex = withoutProtocol.lastIndexOf('@')
  const hostPart =
    atIndex !== -1 ? withoutProtocol.slice(atIndex + 1) : withoutProtocol
  const credsPart = atIndex !== -1 ? withoutProtocol.slice(0, atIndex) : ''

  const colonIndex = credsPart.indexOf(':')
  const rawUsername =
    colonIndex !== -1 ? credsPart.slice(0, colonIndex) : credsPart
  const password = colonIndex !== -1 ? credsPart.slice(colonIndex + 1) : ''

  // ioredis v5 now sends AUTH <username> <password> — empty string username causes WRONGPASS
  // 'default' is the built-in Redis 6+ ACL user for password-only auth
  const username = rawUsername || 'default'

  const [hostPort, dbStr] = hostPart.split('/')
  const [host, portStr] = hostPort.split(':')

  return {
    host,
    port: portStr ? parseInt(portStr, 10) : 6379,
    username,
    ...(password && { password }),
    db: dbStr ? parseInt(dbStr, 10) || 0 : 0,
    tls: protocol === 'rediss' ? {} : undefined,
  }
}

const redisClientProvider = (): Redis => {
  const redisOptions = parseRedisUrl(env.REDIS_URL)

  console.log('Connecting to Redis:', {
    host: redisOptions.host,
    port: redisOptions.port,
    username: redisOptions.username,
    password: redisOptions.password ? '***' : undefined,
    db: redisOptions.db,
    tls: redisOptions.tls,
  })

  const redisClient = new Redis({
    ...redisOptions,
    maxRetriesPerRequest: REDIS_MAX_RETRIES,
  })

  const onError = (err: Error & { code?: string }) => {
    if (err.code === 'ENOTFOUND') {
      redisClient.off('error', onError).quit()
      return
    }
  }
  redisClient.on('error', onError)

  return redisClient
}

export const redisClient = redisClientProvider()
