import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const workoutSchema = z.object({
  title: z.string().min(1),
  frequency: z.enum(["DAILY", "EVERY_OTHER_DAY", "TWICE_WEEKLY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]),
  ageMin: z.number().min(0).max(100).nullable().optional(),
  ageMax: z.number().min(0).max(100).nullable().optional(),
  duration: z.number().min(1),
  programDuration: z.number().min(1).nullable().optional(),
  programDurationUnit: z.enum(["DAY", "WEEK", "MONTH"]).nullable().optional(),
  focus: z.array(z.enum(["HITTING", "PITCHING", "FIELDING", "BASE_RUNNING", "CONDITIONING", "STRENGTH", "AGILITY", "MENTAL", "TEAM_BUILDING"])),
  description: z.string().nullable().optional(),
  active: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workouts = await db.workout.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    })

    return NextResponse.json(workouts)
  } catch (error) {
    console.error("Error fetching workouts:", error)
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received workout data:", JSON.stringify(body, null, 2))

    const validatedData = workoutSchema.parse(body)
    console.log("Validated workout data:", JSON.stringify(validatedData, null, 2))

    const workout = await db.workout.create({
      data: {
        title: validatedData.title,
        frequency: validatedData.frequency,
        ageMin: validatedData.ageMin || null,
        ageMax: validatedData.ageMax || null,
        duration: validatedData.duration,
        programDuration: validatedData.programDuration || null,
        programDurationUnit: validatedData.programDurationUnit || null,
        focus: validatedData.focus,
        description: validatedData.description || null,
        active: validatedData.active !== undefined ? validatedData.active : true,
      },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    })

    console.log("Workout created successfully:", workout.id)

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid workout data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating workout:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to create workout", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
