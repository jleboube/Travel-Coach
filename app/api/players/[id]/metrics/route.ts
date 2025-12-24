import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth-helper'
import { PerformanceType } from '@prisma/client'

const metricSchema = z.object({
  type: z.enum(['EXIT_VELOCITY', 'PULLDOWN_VELOCITY', 'SIXTY_YARD_SPRINT']),
  value: z.number().positive(),
  unit: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional().nullable(),
})

// GET /api/players/[id]/metrics - Get all performance metrics for a player
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PerformanceType | null

    const where: any = { playerId: id }
    if (type) {
      where.type = type
    }

    const metrics = await db.performanceMetric.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    // Also get the latest value for each type
    const latestMetrics = await db.performanceMetric.groupBy({
      by: ['type'],
      where: { playerId: id },
      _max: { date: true },
    })

    // Get the actual records for the latest of each type
    const latestValues: Record<string, any> = {}
    for (const metric of latestMetrics) {
      const latest = await db.performanceMetric.findFirst({
        where: {
          playerId: id,
          type: metric.type,
          date: metric._max.date!,
        },
      })
      if (latest) {
        latestValues[latest.type] = latest
      }
    }

    return NextResponse.json({
      history: metrics,
      latest: latestValues,
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

// POST /api/players/[id]/metrics - Add a new performance metric
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify player exists
    const player = await db.player.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = metricSchema.parse(body)

    // Set default unit based on type
    let unit = validatedData.unit
    if (!unit) {
      switch (validatedData.type) {
        case 'EXIT_VELOCITY':
        case 'PULLDOWN_VELOCITY':
          unit = 'mph'
          break
        case 'SIXTY_YARD_SPRINT':
          unit = 'seconds'
          break
      }
    }

    const metric = await db.performanceMetric.create({
      data: {
        playerId: id,
        type: validatedData.type,
        value: validatedData.value,
        unit: unit!,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        notes: validatedData.notes,
      },
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating performance metric:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create performance metric' },
      { status: 500 }
    )
  }
}
