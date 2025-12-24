import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-helper"
import { db } from "@/lib/db"
import { z } from "zod"

const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["HEAD_COACH", "ASSISTANT_COACH", "TEAM_MANAGER", "PARENT"]),
})

// GET - List all invitations (HEAD_COACH only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "HEAD_COACH") {
      return NextResponse.json(
        { error: "Only head coaches can view invitations" },
        { status: 403 }
      )
    }

    const invitations = await db.invitation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    )
  }
}

// POST - Create a new invitation (HEAD_COACH only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "HEAD_COACH") {
      return NextResponse.json(
        { error: "Only head coaches can send invitations" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role } = invitationSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 400 }
      )
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        expiresAt,
        invitedBy: user.id,
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // TODO: Send invitation email with token
    // For now, we'll just return the invitation
    const invitationLink = `${process.env.NEXTAUTH_URL}/register?token=${invitation.token}`

    return NextResponse.json({
      ...invitation,
      invitationLink,
    })
  } catch (error) {
    console.error("Error creating invitation:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}
