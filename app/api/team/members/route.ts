import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

// GET - List all team members (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const members = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: "asc" }, // HEAD_COACH first
        { createdAt: "asc" },
      ],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}
