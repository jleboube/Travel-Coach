import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First, try to find a Game record with this ID
    let game = await db.game.findUnique({
      where: { id },
      include: {
        playerStats: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
              },
            },
          },
        },
        event: true,
      },
    })

    // If no Game record found, check if it's an Event ID
    if (!game) {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          games: {
            include: {
              playerStats: {
                include: {
                  player: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      jerseyNumber: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!event) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        )
      }

      // If event has a linked game, return it
      if (event.games && event.games.length > 0) {
        game = {
          ...event.games[0],
          event: event,
        }
      } else {
        // Create a game-like object from the event
        game = {
          id: event.id,
          eventId: event.id,
          opponent: event.opponent || "TBD",
          homeAway: "HOME",
          date: event.start,
          score: null,
          opponentScore: null,
          result: null,
          notes: event.description,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          playerStats: [],
          event: event,
        } as any
      }
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // First, check if it's a Game ID
    let game = await db.game.findUnique({
      where: { id },
    })

    if (game) {
      // Update existing game
      game = await db.game.update({
        where: { id },
        data: body,
      })
    } else {
      // Check if it's an Event ID
      const event = await db.event.findUnique({
        where: { id },
        include: {
          games: true,
        },
      })

      if (!event) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        )
      }

      // If event has a linked game, update it
      if (event.games && event.games.length > 0) {
        game = await db.game.update({
          where: { id: event.games[0].id },
          data: body,
        })
      } else {
        // Create a new Game record linked to this event
        game = await db.game.create({
          data: {
            ...body,
            date: event.start,
            eventId: event.id,
            opponent: body.opponent || event.opponent || "TBD",
          },
        })
      }
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.game.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    )
  }
}
