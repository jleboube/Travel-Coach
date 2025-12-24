import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  season: z.string().min(1, "Season is required"),
  logoUrl: z.string().nullable().optional(),
  colors: z.array(z.string()).optional(),
  ageGroup: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received team creation request:", JSON.stringify(body, null, 2))

    const validatedData = createTeamSchema.parse(body)
    console.log("Validated team data:", JSON.stringify(validatedData, null, 2))

    // Check if team name already exists
    const existingTeam = await db.team.findUnique({
      where: { name: validatedData.name },
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: "A team with this name already exists" },
        { status: 409 }
      )
    }

    // Create team and add creator as member in a transaction
    const team = await db.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          name: validatedData.name,
          season: validatedData.season,
          logoUrl: validatedData.logoUrl || null,
          colors: validatedData.colors || [],
          ageGroup: validatedData.ageGroup || null,
        },
      })

      // Add creator as team member with HEAD_COACH role
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: user.userId,
          role: "HEAD_COACH",
        },
      })

      return newTeam
    })

    console.log("Team created successfully:", team.id)

    return NextResponse.json(
      {
        team: {
          id: team.id,
          name: team.name,
          season: team.season,
          joinCode: team.joinCode,
          logoUrl: team.logoUrl,
          colors: team.colors,
          ageGroup: team.ageGroup,
          active: team.active,
          createdAt: team.createdAt.toISOString(),
          updatedAt: team.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid team data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating team:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to create team", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
