import { NextResponse } from "next/server"
import { auth } from "@/auth"

import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tournaments = await db.tournament.findMany({
      include: {
        _count: {
          select: {
            carpools: true,
            expenses: true,
            events: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      startDate,
      endDate,
      location,
      entryFee,
      hotelName,
      hotelLink,
      hotelDeadline,
      perDiem,
      budget,
      notes,
      itinerary,
      eventId,
    } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const tournament = await db.tournament.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        entryFee: entryFee ? parseFloat(entryFee) : null,
        hotelName: hotelName || null,
        hotelLink: hotelLink || null,
        hotelDeadline: hotelDeadline ? new Date(hotelDeadline) : null,
        perDiem: perDiem ? parseFloat(perDiem) : null,
        budget: budget ? parseFloat(budget) : null,
        notes: notes || null,
        itinerary: itinerary || null,
      },
      include: {
        _count: {
          select: {
            carpools: true,
            expenses: true,
            events: true,
          },
        },
      },
    })

    // If eventId is provided, update the existing event with the tournament
    // Otherwise, create a new schedule event for the tournament
    if (eventId) {
      await db.event.update({
        where: { id: eventId },
        data: {
          tournamentId: tournament.id,
        },
      })
    } else {
      await db.event.create({
        data: {
          title: name,
          type: "TOURNAMENT",
          start: new Date(startDate),
          end: new Date(endDate),
          location: location || null,
          description: notes || null,
          tournamentId: tournament.id,
          requiresTravel: true, // Tournaments always require travel
          allDay: false,
        },
      })
    }

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    )
  }
}
