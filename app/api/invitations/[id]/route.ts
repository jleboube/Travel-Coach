import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-helper"
import { db } from "@/lib/db"

// DELETE - Cancel an invitation (HEAD_COACH only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "HEAD_COACH") {
      return NextResponse.json(
        { error: "Only head coaches can cancel invitations" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Update invitation status to CANCELLED
    const invitation = await db.invitation.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Error cancelling invitation:", error)
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    )
  }
}
