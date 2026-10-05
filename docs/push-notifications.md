# Push notifications

How to send a push notification from an API using `@app/notifications`.

The package stores in-app notifications and delivers pushes through the [Expo push service](https://docs.expo.dev/push-notifications/overview/). It is not wired into `apps/api-auth` or `apps/mobile` yet; this guide shows the steps.

## How it works

```
mobile app ── Expo push token ──► API ──► DeviceToken table
                                   │
your code ── notify({ userId … }) ─┤──► Notification table (in-app list)
                                   └──► Expo push service ──► APNs / FCM ──► device
```

A push needs two things: the user's device token saved in `DeviceToken`, and a call to `notify` (or `sendPushNotification`) from server code.

## 1. Add the package to your API

In the API's `package.json` (for example `apps/api-auth/package.json`):

```json
"dependencies": {
  "@app/notifications": "workspace:*"
}
```

Add it to `noExternal` in the API's `tsup.config.ts`, next to the other workspace packages, so it is bundled into the build:

```ts
noExternal: ['@app/common', '@app/database', '@app/http-client', '@app/notifications'],
```

Then run `pnpm install`, and `pnpm db:push` so the `DeviceToken` and `Notification` tables exist.

## 2. Send a notification

Call `notify` from any service or controller once you know the user id:

```ts
import { notify } from '@app/notifications'

await notify({
  userId: user.id,
  type: 'WELCOME', // free-form category, defined by your product
  title: 'Welcome aboard',
  body: 'Your account is ready.',
  entityId: null, // id of a related record, if any
  data: { screen: 'home' }, // optional JSON stored with the notification
})
```

`notify` saves a row in `Notification`, then pushes to every device registered for that user. The push payload carries `notificationId`, `type` and `entityId`, so the app can open the right screen. If the push fails, the stored notification is kept and the error is logged.

To push without storing anything:

```ts
import { sendPushNotification } from '@app/notifications'

await sendPushNotification({
  userId: user.id,
  title: 'Heads up',
  body: 'Something happened.',
  data: { screen: 'home' },
})
```

Do not let a notification break the request that triggers it. Either `await` it inside a `try`/`catch`, or fire it without awaiting and log the error:

```ts
notify({ userId, type: 'WELCOME', title, body }).catch((error) => {
  req.log.error({ err: error, userId }, 'Failed to send notification')
})
```

## 3. Register the device token

Nothing is delivered until the mobile app has sent its Expo push token to the API.

**API endpoint.** Add a module that follows the same layout as the auth modules (`router`, `controller`, `schema`), protected by the bearer token:

```ts
// apps/api-auth/src/modules/v1/notifications/device-token/device-token.controller.ts
import { registerDeviceToken } from '@app/notifications'

// after verifying the bearer token and reading `userId` from it
const saved = await registerDeviceToken(userId, req.body.token, req.body.deviceType)
if (!saved) {
  reply.code(400).send({ message: 'Invalid push token', code: 'VALIDATION_ERROR' })
  return
}
reply.code(200).send({ status: 'OK' })
```

`registerDeviceToken` rejects anything that is not a valid Expo push token and moves a token to the new user if the device changes account. Call `removeDeviceToken(token)` on sign-out.

**Mobile app.** Install `expo-notifications` and `expo-device`, add `'expo-notifications'` to `plugins` in `apps/mobile/app.config.js`, and after sign-in:

```ts
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null // simulators cannot receive pushes

  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null

  const { data } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })
  return data
}

// then send `{ token, deviceType: Platform.OS }` to your device-token endpoint
```

`EAS_PROJECT_ID` must be set, and push credentials must be configured in Expo: an APNs key for iOS and FCM credentials for Android (`eas credentials`).

## 4. Read notifications in the app

```ts
import {
  getUserNotifications,
  markNotificationAsRead,
} from '@app/notifications'

const notifications = await getUserNotifications(userId)
await markNotificationAsRead(userId, notificationId)
```

Expose them as `GET /v1/notifications` and `PATCH /v1/notifications/:id/read`.

## Test a push by hand

Once a real device has registered, send a test from the repo root:

```bash
pnpm with-env pnpm --filter @app/notifications exec tsx -e "
import { notify } from './src'
await notify({ userId: '<user id>', type: 'TEST', title: 'Test', body: 'It works' })
process.exit(0)
"
```

You can also paste the token into the [Expo push tool](https://expo.dev/notifications) to check the device and credentials independently of the API.

## Good to know

- Tokens that Expo reports as `DeviceNotRegistered` are deleted automatically.
- Pushes only reach physical devices. Test with a development or store build: Expo Go no longer supports remote pushes on Android (SDK 53 and later).
- If you enable push security in your Expo account, pass the access token to `new Expo({ accessToken })` in `packages/notifications/src/push.ts`.
- To send from a second service or a background job, add the same dependency there; the package only needs `DATABASE_URL`.
