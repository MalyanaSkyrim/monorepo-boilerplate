import { sendPushNotification } from './push'
import { createNotification, type CreateNotificationInput } from './services'

/**
 * Stores an in-app notification for the user and pushes it to their devices.
 * A push failure never loses the stored notification.
 *
 * @example
 * await notify({
 *   userId,
 *   type: 'ORDER_SHIPPED',
 *   title: 'Your order is on its way',
 *   body: 'Track it from the Orders tab.',
 *   entityId: order.id,
 * })
 */
export async function notify(input: CreateNotificationInput) {
  const notification = await createNotification(input)

  try {
    await sendPushNotification({
      userId: input.userId,
      title: input.title,
      body: input.body,
      data: {
        notificationId: notification.id,
        type: input.type,
        entityId: input.entityId ?? null,
      },
    })
  } catch (error) {
    console.error('[PUSH] Failed to push notification', error)
  }

  return notification
}
