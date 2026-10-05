import { db, type Prisma } from '@app/database'
import { Expo } from 'expo-server-sdk'

export interface CreateNotificationInput {
  userId: string
  /**
   * Free-form category chosen by the caller (e.g. "ORDER_SHIPPED"). The mobile
   * app can switch on it to pick an icon or a deep link.
   */
  type: string
  title: string
  body: string
  /** Id of the record this notification is about, if any. */
  entityId?: string | null
  /** Extra JSON payload stored with the notification. */
  data?: Prisma.InputJsonObject
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markNotificationAsRead(userId: string, id: string) {
  return db.notification.update({
    where: { id, userId },
    data: { isRead: true },
  })
}

export async function registerDeviceToken(
  userId: string,
  token: string,
  deviceType?: string,
) {
  if (!token || !Expo.isExpoPushToken(token)) {
    console.warn(`[PUSH] Rejecting invalid device token: ${token}`)
    return null
  }

  return db.deviceToken.upsert({
    where: { token },
    create: { userId, token, deviceType },
    update: { userId, deviceType },
  })
}

/** Removes a device, e.g. on sign-out. Returns how many rows were deleted. */
export async function removeDeviceToken(token: string): Promise<number> {
  const { count } = await db.deviceToken.deleteMany({ where: { token } })
  return count
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  entityId = null,
  data,
}: CreateNotificationInput) {
  return db.notification.create({
    data: { userId, type, title, body, entityId, data },
  })
}
