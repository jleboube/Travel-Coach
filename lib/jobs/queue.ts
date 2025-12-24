// This module is only meant to be used on the server side
// Uses database-based scheduling instead of Bull queue for Next.js compatibility

import { db } from "@/lib/db"

// Job type definitions
export interface EventReminderJob {
  type: "event_reminder"
  eventId: string
  reminderType: "24h" | "1h"
}

export interface TournamentTravelJob {
  type: "tournament_travel"
  tournamentId: string
}

export interface AnnouncementJob {
  type: "announcement"
  announcementId: string
}

export type NotificationJob =
  | EventReminderJob
  | TournamentTravelJob
  | AnnouncementJob

/**
 * Schedule an event reminder notification
 * Stores in database for processing by a cron job or API route
 */
export async function scheduleEventReminder(
  eventId: string,
  eventStart: Date,
  reminderType: "24h" | "1h"
): Promise<unknown | null> {
  const delayMs =
    reminderType === "24h"
      ? 24 * 60 * 60 * 1000 // 24 hours
      : 1 * 60 * 60 * 1000 // 1 hour

  const scheduledTime = new Date(eventStart.getTime() - delayMs)

  // Don't schedule if the reminder time has already passed
  if (scheduledTime <= new Date()) {
    return null
  }

  // Store in database
  return db.scheduledNotification.create({
    data: {
      type: `event_reminder_${reminderType}`,
      referenceId: eventId,
      scheduledFor: scheduledTime,
    },
  })
}

/**
 * Schedule a tournament travel booking reminder (90 days before)
 */
export async function scheduleTournamentTravelReminder(
  tournamentId: string,
  tournamentStart: Date
): Promise<unknown | null> {
  const daysBeforeMs = 90 * 24 * 60 * 60 * 1000 // 90 days
  const scheduledTime = new Date(tournamentStart.getTime() - daysBeforeMs)

  // Don't schedule if the reminder time has already passed
  if (scheduledTime <= new Date()) {
    return null
  }

  // Store in database
  return db.scheduledNotification.create({
    data: {
      type: "tournament_travel",
      referenceId: tournamentId,
      scheduledFor: scheduledTime,
    },
  })
}

/**
 * Queue an immediate announcement notification
 */
export async function queueAnnouncementNotification(
  announcementId: string
): Promise<unknown> {
  // For immediate notifications, schedule for now
  return db.scheduledNotification.create({
    data: {
      type: "announcement",
      referenceId: announcementId,
      scheduledFor: new Date(),
    },
  })
}

/**
 * Cancel scheduled notifications for an event
 */
export async function cancelEventReminders(eventId: string): Promise<void> {
  await db.scheduledNotification.deleteMany({
    where: {
      referenceId: eventId,
      type: { startsWith: "event_reminder" },
      sent: false,
    },
  })
}

/**
 * Cancel scheduled notifications for a tournament
 */
export async function cancelTournamentReminder(
  tournamentId: string
): Promise<void> {
  await db.scheduledNotification.deleteMany({
    where: {
      referenceId: tournamentId,
      type: "tournament_travel",
      sent: false,
    },
  })
}
