import { db } from '@app/database'
import {
  Expo,
  type ExpoPushMessage,
  type ExpoPushTicket,
} from 'expo-server-sdk'

// Pass `{ accessToken }` here if you enable push security in your Expo account.
const expo = new Expo()

export type PushNotificationData = Record<
  string,
  string | number | boolean | null
>

export interface SendPushNotificationInput {
  userId: string
  title: string
  body: string
  /** Delivered to the app in the notification payload. */
  data?: PushNotificationData
}

/**
 * Sends a push notification to every device registered for the user through
 * the Expo push service. Tokens Expo reports as unregistered are deleted.
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  data,
}: SendPushNotificationInput): Promise<ExpoPushTicket[]> {
  const deviceTokens = await db.deviceToken.findMany({ where: { userId } })

  const messages: ExpoPushMessage[] = []
  for (const { token } of deviceTokens) {
    if (!Expo.isExpoPushToken(token)) {
      await db.deviceToken.deleteMany({ where: { token } })
      continue
    }

    messages.push({ to: token, sound: 'default', title, body, data })
  }

  if (messages.length === 0) {
    return []
  }

  const tickets: ExpoPushTicket[] = []

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)

      for (const [index, ticket] of ticketChunk.entries()) {
        if (ticket.status !== 'error') continue

        console.error(`[PUSH] Ticket error: ${ticket.message}`, ticket.details)

        const to = chunk[index]?.to
        if (ticket.details?.error === 'DeviceNotRegistered' && to) {
          await db.deviceToken.deleteMany({
            where: { token: { in: Array.isArray(to) ? to : [to] } },
          })
        }
      }

      tickets.push(...ticketChunk)
    } catch (error) {
      console.error('[PUSH] Error sending push chunk', error)
    }
  }

  return tickets
}
