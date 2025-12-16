import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { db } from '@/lib/db'
import { z } from 'zod'

const playerUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  jerseyNumber: z.number().min(0).max(99).optional(),
  photo: z.string().optional().nullable(),
  positions: z.array(z.string()).min(1).optional(),
  bats: z.enum(['R', 'L', 'S']).optional(),
  throws: z.enum(['R', 'L']).optional(),
  graduationYear: z.number().min(2020).max(2040).optional(),
  birthDate: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  parentEmail: z.string().email().optional().nullable().or(z.literal('')),
  active: z.boolean().optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const player = await db.player.findUnique({
      where: { id },
      include: {
        stats: {
          orderBy: { season: 'desc' },
        },
        customMetrics: {
          orderBy: { date: 'desc' },
        },
        gameStats: {
          include: {
            game: true,
          },
          orderBy: {
            game: {
              date: 'desc',
            },
          },
          take: 10,
        },
      },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate the request body
    const validatedData = playerUpdateSchema.parse(body)

    // Check if player exists
    const existingPlayer = await db.player.findUnique({
      where: { id },
    })

    if (!existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // If jersey number is being updated, check if it's already taken
    if (validatedData.jerseyNumber && validatedData.jerseyNumber !== existingPlayer.jerseyNumber) {
      const jerseyTaken = await db.player.findFirst({
        where: {
          jerseyNumber: validatedData.jerseyNumber,
          active: true,
          id: { not: id },
        },
      })

      if (jerseyTaken) {
        return NextResponse.json(
          { error: `Jersey number ${validatedData.jerseyNumber} is already taken by ${jerseyTaken.firstName} ${jerseyTaken.lastName}` },
          { status: 400 }
        )
      }
    }

    // Convert birthDate string to Date if provided
    const updateData: any = {
      ...validatedData,
    }

    if (validatedData.birthDate !== undefined) {
      updateData.birthDate = validatedData.birthDate ? new Date(validatedData.birthDate) : null
    }

    if (validatedData.parentEmail !== undefined) {
      updateData.parentEmail = validatedData.parentEmail || null
    }

    const player = await db.player.update({
      where: { id },
      data: updateData,
      include: {
        stats: {
          orderBy: { season: 'desc' },
        },
        customMetrics: {
          orderBy: { date: 'desc' },
        },
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check if player exists
    const existingPlayer = await db.player.findUnique({
      where: { id },
    })

    if (!existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Soft delete by setting active to false instead of hard delete
    await db.player.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ message: 'Player deactivated successfully' })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}
