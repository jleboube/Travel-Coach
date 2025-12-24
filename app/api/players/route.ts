import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth-helper'

const playerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jerseyNumber: z.number().min(0).max(99),
  photo: z.string().optional().nullable(),
  positions: z.array(z.string()).min(1, 'At least one position is required'),
  bats: z.enum(['R', 'L', 'S']),
  throws: z.enum(['R', 'L']),
  graduationYear: z.number().min(2020).max(2040),
  birthDate: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  parentEmail: z.string().email().optional().nullable().or(z.literal('')),
  active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const search = searchParams.get('search')
    const position = searchParams.get('position')

    const where: any = {}

    if (active !== null) {
      where.active = active === 'true'
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (position) {
      where.positions = { has: position }
    }

    const players = await db.player.findMany({
      where,
      include: {
        stats: {
          orderBy: { season: 'desc' },
        },
        customMetrics: {
          orderBy: { date: 'desc' },
          take: 3,
        },
        performanceMetrics: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: [
        { jerseyNumber: 'asc' },
        { lastName: 'asc' },
      ],
    })

    // Process to get latest performance metrics for each player
    const playersWithLatestMetrics = players.map(player => {
      const latestMetrics: Record<string, any> = {}
      const seenTypes = new Set<string>()

      for (const metric of player.performanceMetrics) {
        if (!seenTypes.has(metric.type)) {
          latestMetrics[metric.type] = metric
          seenTypes.add(metric.type)
        }
      }

      return {
        ...player,
        latestPerformanceMetrics: latestMetrics,
      }
    })

    return NextResponse.json(playersWithLatestMetrics)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validatedData = playerSchema.parse(body)

    // Convert birthDate string to Date if provided
    const playerData: any = {
      ...validatedData,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      parentEmail: validatedData.parentEmail || null,
    }

    // Check if jersey number is already taken
    const existingPlayer = await db.player.findFirst({
      where: {
        jerseyNumber: playerData.jerseyNumber,
        active: true,
      },
    })

    if (existingPlayer) {
      return NextResponse.json(
        { error: `Jersey number ${playerData.jerseyNumber} is already taken by ${existingPlayer.firstName} ${existingPlayer.lastName}` },
        { status: 400 }
      )
    }

    const player = await db.player.create({
      data: playerData,
      include: {
        stats: true,
        customMetrics: true,
        performanceMetrics: true,
      },
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
