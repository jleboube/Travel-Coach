import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { z } from "zod"

const joinTeamSchema = z.object({
  joinCode: z.string().min(1, "Join code is required"),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received team join request:", JSON.stringify(body, null, 2))

    const validatedData = joinTeamSchema.parse(body)
    console.log("Validated join data:", JSON.stringify(validatedData, null, 2))

    // Find team by join code
    const team = await db.team.findUnique({
      where: { joinCode: validatedData.joinCode },
      include: {
        members: {
          where: { userId: user.userId },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Invalid join code" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    if (team.members.length > 0) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 409 }
      )
    }

    // Add user as team member
    await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.userId,
        role: (user.role as any) || "ASSISTANT_COACH", // Use user's role or default to ASSISTANT_COACH
      },
    })

    console.log("User joined team successfully:", team.id)

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
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid join data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error joining team:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to join team", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
