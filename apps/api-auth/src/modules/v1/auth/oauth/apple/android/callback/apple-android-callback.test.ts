import { build } from '../../../../../../../utils/vitestHelper'

describe('Apple Android OAuth callback', () => {
  const app = build()

  test('returns 200 HTML', async () => {
    const res = await app.inject({
      url: '/v1/auth/oauth/apple/android/callback',
      method: 'GET',
    })
    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.body).toContain('return to the app')
  })

  test('accepts Apple query params without error', async () => {
    const res = await app.inject({
      url: '/v1/auth/oauth/apple/android/callback?state=x&code=y',
      method: 'GET',
    })
    expect(res.statusCode).toEqual(200)
  })
})
