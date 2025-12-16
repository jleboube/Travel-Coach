import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    )
  }
}
