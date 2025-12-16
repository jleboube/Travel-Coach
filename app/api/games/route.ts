import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Fetch all game/practice/tournament events from the schedule
    const events = await db.event.findMany({
      where: {
        type: {
          in: ["GAME", "PRACTICE", "TOURNAMENT"],
        },
      },
      orderBy: {
        start: "desc",
      },
      include: {
        games: {
          include: {
            playerStats: {
              include: {
                player: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Transform events to match the expected Game structure
    const games = events.map((event) => {
      // If the event has an associated Game record, use it
      if (event.games && event.games.length > 0) {
        return {
          ...event.games[0],
          event: {
            id: event.id,
            title: event.title,
            type: event.type,
            start: event.start,
            end: event.end,
            location: event.location,
            opponent: event.opponent,
            description: event.description,
          },
        }
      }

      // Otherwise, create a game-like object from the event
      return {
        id: event.id,
        eventId: event.id,
        opponent: event.opponent || "TBD",
        homeAway: "HOME", // Default to HOME if not specified
        date: event.start,
        score: null,
        opponentScore: null,
        result: null,
        notes: event.description,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        playerStats: [],
        event: {
          id: event.id,
          title: event.title,
          type: event.type,
          start: event.start,
          end: event.end,
          location: event.location,
          opponent: event.opponent,
          description: event.description,
        },
      }
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { opponent, homeAway, date, score, opponentScore, result, notes, eventId } = body

    // Validate required fields
    if (!opponent || !homeAway || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const game = await db.game.create({
      data: {
        opponent,
        homeAway,
        date: new Date(date),
        score,
        opponentScore,
        result,
        notes,
        eventId: eventId || null,
      },
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    )
  }
}
