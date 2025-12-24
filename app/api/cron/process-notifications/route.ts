import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  sendNotificationToAll,
  isFirebaseConfigured,
} from "@/lib/notifications/push-service"

// This endpoint should be called by a cron job every minute
// Add authentication in production (e.g., verify a secret header)

export async function GET(request: NextRequest) {
  // Simple auth check - verify cron secret
  const cronSecret = request.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isFirebaseConfigured()) {
    return NextResponse.json({
      message: "Firebase not configured, skipping notification processing",
    })
  }

  try {
    // Find all pending notifications that are due
    const pendingNotifications = await db.scheduledNotification.findMany({
      where: {
        sent: false,
        scheduledFor: { lte: new Date() },
      },
      take: 50, // Process in batches
    })

    if (pendingNotifications.length === 0) {
      return NextResponse.json({ message: "No pending notifications" })
    }

    const results = []

    for (const notification of pendingNotifications) {
      try {
        let sent = false

        if (notification.type.startsWith("event_reminder")) {
          sent = await processEventReminder(notification.referenceId, notification.type)
        } else if (notification.type === "tournament_travel") {
          sent = await processTournamentTravel(notification.referenceId)
        } else if (notification.type === "announcement") {
          sent = await processAnnouncement(notification.referenceId)
        }

        // Mark as sent
        await db.scheduledNotification.update({
          where: { id: notification.id },
          data: { sent: true, sentAt: new Date() },
        })

        results.push({ id: notification.id, sent })
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error)
        results.push({ id: notification.id, error: String(error) })
      }
    }

    return NextResponse.json({ processed: results.length, results })
  } catch (error) {
    console.error("Error processing notifications:", error)
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    )
  }
}

async function processEventReminder(eventId: string, type: string): Promise<boolean> {
  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return false

  const hoursUntil = type.includes("24h") ? "24 hours" : "1 hour"
  const eventType = formatEventType(event.type)

  await sendNotificationToAll({
    title: `${eventType} Reminder`,
    body: `${event.title} starts in ${hoursUntil}${event.location ? ` at ${event.location}` : ""}`,
    data: {
      type: "event_reminder",
      eventId: event.id,
      eventType: event.type,
    },
  })

  return true
}

async function processTournamentTravel(tournamentId: string): Promise<boolean> {
  const tournament = await db.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) return false

  const hasHotelBooked = tournament.hotelName && tournament.hotelLink
  const body = hasHotelBooked
    ? `${tournament.name} is 90 days away! Hotel: ${tournament.hotelName}. Make sure your reservation is confirmed.`
    : `${tournament.name} is 90 days away! Time to book travel and accommodations.`

  await sendNotificationToAll({
    title: "Tournament Travel Reminder",
    body,
    data: {
      type: "tournament_travel",
      tournamentId: tournament.id,
    },
  })

  return true
}

async function processAnnouncement(announcementId: string): Promise<boolean> {
  const announcement = await db.announcement.findUnique({ where: { id: announcementId } })
  if (!announcement) return false

  const priorityEmoji =
    announcement.priority === "URGENT" ? "🚨" : announcement.priority === "HIGH" ? "⚠️" : ""

  await sendNotificationToAll({
    title: `${priorityEmoji} ${announcement.title}`.trim(),
    body:
      announcement.content.length > 100
        ? announcement.content.substring(0, 100) + "..."
        : announcement.content,
    data: {
      type: "announcement",
      announcementId: announcement.id,
      priority: announcement.priority,
    },
  })

  return true
}

function formatEventType(type: string): string {
  const typeMap: Record<string, string> = {
    PRACTICE: "Practice",
    GAME: "Game",
    TOURNAMENT: "Tournament",
    TEAM_MEETING: "Team Meeting",
    FUNDRAISER: "Fundraiser",
    OFF_DAY: "Off Day",
    INDIVIDUAL_LESSON: "Individual Lesson",
  }
  return typeMap[type] || type
}
