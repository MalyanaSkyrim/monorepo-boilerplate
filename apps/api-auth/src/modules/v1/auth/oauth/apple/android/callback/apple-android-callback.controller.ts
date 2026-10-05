import { RouteHandler } from 'fastify'

/**
 * Apple Sign in with Android (Invertase web flow) redirect URI.
 * Apple appends query parameters (e.g. code, state, id_token) to this URL; the native
 * WebView intercepts them — this handler only needs to return 200 + minimal HTML if the
 * response is shown briefly in the WebView or opened in a browser.
 */
export const appleAndroidOAuthCallbackHandler: RouteHandler = async (
  _req,
  reply,
) => {
  reply
    .code(200)
    .header('Content-Type', 'text/html; charset=utf-8')
    .header('Cache-Control', 'no-store')
    .send(
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Sign in</title></head><body><p>You can return to the app.</p></body></html>',
    )
}
