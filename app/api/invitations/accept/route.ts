import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const acceptInvitationSchema = z.object({
  token: z.string(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// POST - Accept an invitation and create user account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, password } = acceptInvitationSchema.parse(body)

    // Find the invitation
    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 400 }
      )
    }

    // Check if invitation is still valid
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation has already been used or cancelled" },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })

      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with the role from invitation
    const user = await db.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
        role: invitation.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Mark invitation as accepted
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    })

    return NextResponse.json({
      message: "Account created successfully",
      user,
    })
  } catch (error) {
    console.error("Error accepting invitation:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    )
  }
}
