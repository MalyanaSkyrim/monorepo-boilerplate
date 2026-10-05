import { FastifyPluginAsync } from 'fastify'

import { appleAndroidOAuthCallbackHandler } from './apple-android-callback.controller'

/**
 * Registered Return URL for Sign in with Apple on Android (Services ID in Apple Developer).
 * Full path: GET /v1/auth/oauth/apple/android/callback
 * User: set EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_REDIRECT_URI to the public https URL for this path.
 */
const appleAndroidOAuthCallback: FastifyPluginAsync = async (
  fastify,
): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        hide: true,
        description:
          'Apple Sign in with Apple (Android) OAuth redirect — minimal HTML; WebView intercepts tokens.',
      },
    },
    appleAndroidOAuthCallbackHandler,
  )
}

export default appleAndroidOAuthCallback
