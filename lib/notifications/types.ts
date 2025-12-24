// Push notification types and payloads

export type NotificationType =
  | "event_reminder"
  | "tournament_travel"
  | "announcement"
  | "rsvp_request"

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
}

export interface EventReminderPayload extends NotificationPayload {
  data: {
    type: "event_reminder"
    eventId: string
    eventType: string
    hoursUntil: string
  }
}

export interface TournamentTravelPayload extends NotificationPayload {
  data: {
    type: "tournament_travel"
    tournamentId: string
    daysUntil: string
  }
}

export interface AnnouncementPayload extends NotificationPayload {
  data: {
    type: "announcement"
    announcementId: string
    priority: string
  }
}

export interface ScheduleNotificationOptions {
  type: NotificationType
  referenceId: string
  scheduledFor: Date
  payload: NotificationPayload
}

// Notification timing configurations
export const NOTIFICATION_TIMING = {
  // Event reminders
  EVENT_REMINDER_24H: 24 * 60 * 60 * 1000, // 24 hours in ms
  EVENT_REMINDER_1H: 1 * 60 * 60 * 1000, // 1 hour in ms

  // Tournament travel reminder
  TOURNAMENT_TRAVEL_DAYS: 90, // days before tournament

  // RSVP reminder
  RSVP_REMINDER_HOURS: 48, // hours before event if no RSVP
} as const
