import {
  BetterFetch,
  createFetch,
  CreateFetchOption,
  Schema,
} from '@better-fetch/fetch'

import { querySerializerPlugin } from '../plugins/query-serializer'
import { isValidHttpURL } from './helpers'
import { CreateBetterFetchOptions } from './types'

export function createBetterFetch<TSchema extends Schema = Schema>(
  options: CreateBetterFetchOptions<TSchema> = {},
): BetterFetch<{ schema: TSchema; throw: true }> {
  const { baseURL, schema, headers, ...restOptions } = options
  const fetchOptions = {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    schema,
    throw: true,
    plugins: [querySerializerPlugin],
    customFetchImpl: async (url, options) => {
      const body = options?.body

      /**
       * This is a workaround to fix issue of body not being stringified
       * when the request is executed from NextJS app.
       */
      if (body && typeof body !== 'string') {
        const isPlainObject =
          body.constructor === Object ||
          (body.constructor === undefined && typeof body === 'object')

        if (isPlainObject) {
          options.body = JSON.stringify(body)
        }
      }

      // Remove all query handling - plugin handles this now

      const baseURL =
        options && 'baseURL' in options ? options.baseURL : undefined
      const validURL =
        baseURL && !isValidHttpURL(url.toString())
          ? baseURL + url.toString()
          : url.toString()

      // Log the outgoing request
      const method = options?.method || 'GET'
      console.log(`[HTTP] ↗️ ${method} ${validURL}`)

      try {
        const startTime = Date.now()
        const response = await fetch(validURL, options)
        const duration = Date.now() - startTime
        console.log(
          `[HTTP] ↙️ ${method} ${validURL} - ${response.status} ${response.statusText} (${duration}ms)`,
        )
        return response
      } catch (error: unknown) {
        console.error(
          `[HTTP] ❌ ${method} ${validURL} - Error: ${(error as Error)?.message || 'Unknown Network Error'}`,
        )
        throw error
      }
    },
    ...restOptions,
  } satisfies CreateFetchOption

  return createFetch(fetchOptions as CreateFetchOption)
}
