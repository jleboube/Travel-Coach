import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const teamUpdateSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  season: z.string().min(1, "Season is required"),
  ageGroup: z.string().optional().nullable(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is HEAD_COACH
    if (session.user.role !== "HEAD_COACH") {
      return NextResponse.json(
        { error: "Only head coaches can update team settings" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { teamName, season, ageGroup } = teamUpdateSchema.parse(body)

    // Get existing team config
    const existingConfig = await db.teamConfig.findFirst()

    let teamConfig

    if (existingConfig) {
      // Update existing config
      teamConfig = await db.teamConfig.update({
        where: { id: existingConfig.id },
        data: {
          teamName,
          season,
          ageGroup: ageGroup || null,
        },
      })
    } else {
      // Create new config
      teamConfig = await db.teamConfig.create({
        data: {
          teamName,
          season,
          ageGroup: ageGroup || null,
        },
      })
    }

    return NextResponse.json(teamConfig)
  } catch (error) {
    console.error("Error updating team settings:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update team settings" },
      { status: 500 }
    )
  }
}
