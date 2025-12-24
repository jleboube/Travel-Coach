import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { z } from "zod"
import { scheduleEventReminder } from "@/lib/jobs/queue"

const eventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["PRACTICE", "GAME", "TOURNAMENT", "TEAM_MEETING", "FUNDRAISER", "OFF_DAY", "INDIVIDUAL_LESSON"]),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().optional(),
  location: z.string().nullable().optional(),
  locationUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  opponent: z.string().nullable().optional(),
  governingBody: z.enum(["NA", "PBR", "USSSA", "JP_SPORTS", "PG", "GAMEDAY"]).optional(),
  requiresTravel: z.boolean().optional(),
  recurring: z.boolean().optional(),
  rrule: z.string().nullable().optional(),
  tournamentId: z.string().nullable().optional(),
})

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { start: "asc" },
      include: {
        rsvps: true,
        tournament: true,
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received event data:", JSON.stringify(body, null, 2))

    const validatedData = eventSchema.parse(body)
    console.log("Validated event data:", JSON.stringify(validatedData, null, 2))

    const eventData = {
      title: validatedData.title,
      type: validatedData.type,
      start: new Date(validatedData.start),
      end: new Date(validatedData.end),
      allDay: validatedData.allDay || false,
      location: validatedData.location || null,
      locationUrl: validatedData.locationUrl || null,
      description: validatedData.description || null,
      color: validatedData.color || null,
      opponent: validatedData.opponent || null,
      governingBody: validatedData.governingBody || "NA",
      requiresTravel: validatedData.requiresTravel || false,
      recurring: validatedData.recurring || false,
      rrule: validatedData.rrule || null,
      tournamentId: validatedData.tournamentId || null,
    }

    console.log("Creating event with data:", JSON.stringify(eventData, null, 2))

    const event = await db.event.create({
      data: eventData,
      include: {
        rsvps: true,
        tournament: true,
      },
    })

    console.log("Event created successfully:", event.id)

    // Schedule push notification reminders (24h and 1h before)
    try {
      await scheduleEventReminder(event.id, event.start, "24h")
      await scheduleEventReminder(event.id, event.start, "1h")
    } catch (err) {
      // Log but don't fail the request if notification scheduling fails
      console.error("Failed to schedule event reminders:", err)
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid event data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating event:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to create event", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
