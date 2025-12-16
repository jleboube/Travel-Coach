import { NextResponse } from "next/server"
import { auth } from "@/auth"

import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        carpools: {
          orderBy: { driverName: 'asc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
        events: {
          orderBy: { start: 'asc' },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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
    } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (location !== undefined) updateData.location = location || null
    if (entryFee !== undefined) updateData.entryFee = entryFee ? parseFloat(entryFee) : null
    if (hotelName !== undefined) updateData.hotelName = hotelName || null
    if (hotelLink !== undefined) updateData.hotelLink = hotelLink || null
    if (hotelDeadline !== undefined) updateData.hotelDeadline = hotelDeadline ? new Date(hotelDeadline) : null
    if (perDiem !== undefined) updateData.perDiem = perDiem ? parseFloat(perDiem) : null
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null
    if (notes !== undefined) updateData.notes = notes || null
    if (itinerary !== undefined) updateData.itinerary = itinerary || null

    const tournament = await db.tournament.update({
      where: { id },
      data: updateData,
      include: {
        carpools: true,
        expenses: true,
        events: true,
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { error: "Failed to update tournament" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.tournament.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { error: "Failed to delete tournament" },
      { status: 500 }
    )
  }
}
