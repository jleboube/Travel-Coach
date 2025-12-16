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

    const carpools = await db.carpool.findMany({
      where: { tournamentId: id },
      orderBy: { driverName: 'asc' },
    })

    return NextResponse.json(carpools)
  } catch (error) {
    console.error('Error fetching carpools:', error)
    return NextResponse.json(
      { error: "Failed to fetch carpools" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { driverName, driverPhone, seatsOffered, passengers } = body

    if (!driverName || !seatsOffered) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const carpool = await db.carpool.create({
      data: {
        tournamentId: id,
        driverName,
        driverPhone: driverPhone || null,
        seatsOffered: parseInt(seatsOffered),
        passengers: passengers || [],
      },
    })

    return NextResponse.json(carpool, { status: 201 })
  } catch (error) {
    console.error('Error creating carpool:', error)
    return NextResponse.json(
      { error: "Failed to create carpool" },
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

    const body = await request.json()
    const { carpoolId, ...updateData } = body

    if (!carpoolId) {
      return NextResponse.json(
        { error: "Carpool ID required" },
        { status: 400 }
      )
    }

    const carpool = await db.carpool.update({
      where: { id: carpoolId },
      data: updateData,
    })

    return NextResponse.json(carpool)
  } catch (error) {
    console.error('Error updating carpool:', error)
    return NextResponse.json(
      { error: "Failed to update carpool" },
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

    const { searchParams } = new URL(request.url)
    const carpoolId = searchParams.get('carpoolId')

    if (!carpoolId) {
      return NextResponse.json(
        { error: "Carpool ID required" },
        { status: 400 }
      )
    }

    await db.carpool.delete({
      where: { id: carpoolId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting carpool:', error)
    return NextResponse.json(
      { error: "Failed to delete carpool" },
      { status: 500 }
    )
  }
}
