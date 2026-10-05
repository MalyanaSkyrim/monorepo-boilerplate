# @app/notifications

Server-side helpers for in-app notifications and push delivery through the Expo push service.

```ts
import { notify, registerDeviceToken } from '@app/notifications'

// When the mobile app reports its Expo push token
await registerDeviceToken(userId, expoPushToken, 'ios')

// Store a notification and push it to the user's devices
await notify({
  userId,
  type: 'WELCOME',
  title: 'Welcome aboard',
  body: 'Your account is ready.',
})
```

- `notify` stores the notification, then pushes it
- `createNotification`, `getUserNotifications`, `markNotificationAsRead` manage the in-app list
- `registerDeviceToken`, `removeDeviceToken` manage devices
- `sendPushNotification` pushes without storing

`type` is a free-form string, so each product defines its own categories.

The data lives in the `Notification` and `DeviceToken` models in `packages/database/prisma/notification/notification.prisma`.

The package is not wired into an app yet. To use it, add endpoints that call `registerDeviceToken` and `getUserNotifications`, and have the mobile app request permission and send its token with `expo-notifications`.
