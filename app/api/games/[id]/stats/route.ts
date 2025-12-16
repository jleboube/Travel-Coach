import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const stats = await db.gamePlayerStat.findMany({
      where: { gameId: id },
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
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching game stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch game stats" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { stats } = body

    if (!Array.isArray(stats)) {
      return NextResponse.json(
        { error: "Stats must be an array" },
        { status: 400 }
      )
    }

    // Delete existing stats for this game
    await db.gamePlayerStat.deleteMany({
      where: { gameId: id },
    })

    // Create new stats
    const createdStats = await db.gamePlayerStat.createMany({
      data: stats.map((stat: any) => ({
        gameId: id,
        playerId: stat.playerId,
        ab: stat.ab || 0,
        h: stat.h || 0,
        doubles: stat.doubles || 0,
        triples: stat.triples || 0,
        hr: stat.hr || 0,
        rbi: stat.rbi || 0,
        bb: stat.bb || 0,
        k: stat.k || 0,
        ip: stat.ip || 0,
        pitchingH: stat.pitchingH || 0,
        r: stat.r || 0,
        er: stat.er || 0,
        pitchingBB: stat.pitchingBB || 0,
        pitchingK: stat.pitchingK || 0,
        po: stat.po || 0,
        a: stat.a || 0,
        e: stat.e || 0,
      })),
    })

    // Fetch the created stats with player info
    const updatedStats = await db.gamePlayerStat.findMany({
      where: { gameId: id },
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
    })

    return NextResponse.json(updatedStats, { status: 201 })
  } catch (error) {
    console.error("Error saving game stats:", error)
    return NextResponse.json(
      { error: "Failed to save game stats" },
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
    const { playerId, ...statData } = body

    const stat = await db.gamePlayerStat.upsert({
      where: {
        gameId_playerId: {
          gameId: id,
          playerId,
        },
      },
      update: statData,
      create: {
        gameId: id,
        playerId,
        ...statData,
      },
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
    })

    return NextResponse.json(stat)
  } catch (error) {
    console.error("Error updating game stat:", error)
    return NextResponse.json(
      { error: "Failed to update game stat" },
      { status: 500 }
    )
  }
}
