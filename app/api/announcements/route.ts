import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

import { db } from "@/lib/db"

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, priority } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        priority: priority || "NORMAL",
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    )
  }
}
