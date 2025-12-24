import admin from "firebase-admin"
import { db } from "@/lib/db"
import type { NotificationPayload } from "./types"

// Initialize Firebase Admin SDK (singleton pattern)
let firebaseApp: admin.app.App | null = null

function getFirebaseApp(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp
  }

  // Check if already initialized
  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0]!
    return firebaseApp
  }

  // Initialize with credentials from environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    )
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  return firebaseApp
}

/**
 * Send a push notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  // Get all active device tokens for the user
  const deviceTokens = await db.deviceToken.findMany({
    where: {
      userId,
      active: true,
    },
    select: {
      token: true,
      platform: true,
    },
  })

  if (deviceTokens.length === 0) {
    return { success: true, sent: 0, failed: 0 }
  }

  const tokens = deviceTokens.map((dt) => dt.token)
  return sendNotificationToTokens(tokens, payload)
}

/**
 * Send a push notification to multiple tokens
 */
export async function sendNotificationToTokens(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  if (tokens.length === 0) {
    return { success: true, sent: 0, failed: 0 }
  }

  try {
    const app = getFirebaseApp()
    const messaging = app.messaging()

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    const response = await messaging.sendEachForMulticast(message)

    // Handle failed tokens (mark as inactive)
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code
          // If token is invalid or unregistered, mark it as inactive
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx])
          }
        }
      })

      if (failedTokens.length > 0) {
        await db.deviceToken.updateMany({
          where: {
            token: { in: failedTokens },
          },
          data: {
            active: false,
          },
        })
      }
    }

    return {
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    }
  } catch (error) {
    console.error("Error sending push notification:", error)
    return { success: false, sent: 0, failed: tokens.length }
  }
}

/**
 * Send a push notification to all users with active device tokens
 */
export async function sendNotificationToAll(
  payload: NotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  // Get all active device tokens
  const deviceTokens = await db.deviceToken.findMany({
    where: {
      active: true,
    },
    select: {
      token: true,
    },
  })

  if (deviceTokens.length === 0) {
    return { success: true, sent: 0, failed: 0 }
  }

  const tokens = deviceTokens.map((dt) => dt.token)

  // Firebase has a limit of 500 tokens per multicast
  const batchSize = 500
  let totalSent = 0
  let totalFailed = 0

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize)
    const result = await sendNotificationToTokens(batch, payload)
    totalSent += result.sent
    totalFailed += result.failed
  }

  return {
    success: true,
    sent: totalSent,
    failed: totalFailed,
  }
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}
