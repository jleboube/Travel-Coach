import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-helper"
import { db } from "@/lib/db"
import { z } from "zod"

const registerTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
})

// POST: Register a device token for push notifications
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = registerTokenSchema.parse(body)

    // Upsert the device token (update if exists, create if not)
    const deviceToken = await db.deviceToken.upsert({
      where: {
        userId_token: {
          userId: user.id,
          token: validatedData.token,
        },
      },
      update: {
        active: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        token: validatedData.token,
        platform: validatedData.platform,
        active: true,
      },
    })

    return NextResponse.json({
      success: true,
      id: deviceToken.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error registering device token:", error)
    return NextResponse.json(
      { error: "Failed to register device token" },
      { status: 500 }
    )
  }
}

// DELETE: Unregister a device token (on logout or uninstall)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token parameter is required" },
        { status: 400 }
      )
    }

    // Soft delete - mark as inactive rather than deleting
    await db.deviceToken.updateMany({
      where: {
        userId: user.id,
        token: token,
      },
      data: {
        active: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unregistering device token:", error)
    return NextResponse.json(
      { error: "Failed to unregister device token" },
      { status: 500 }
    )
  }
}
