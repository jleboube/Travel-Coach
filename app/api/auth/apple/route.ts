import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import jwt from "jsonwebtoken"
import { AppleAuthService } from "@/lib/auth/apple"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identityToken, authorizationCode, fullName, email } = body

    // Verify the Apple identity token
    const appleService = new AppleAuthService()
    const appleUser = await appleService.verifyToken(identityToken)

    if (!appleUser) {
      return NextResponse.json(
        { error: "Invalid Apple ID token" },
        { status: 401 }
      )
    }

    // Check if user exists by Apple ID
    let user = await db.user.findFirst({
      where: {
        accounts: {
          some: {
            provider: "apple",
            providerAccountId: appleUser.sub,
          },
        },
      },
    })

    let isNewUser = false

    if (!user) {
      // Create new user
      isNewUser = true

      const userName = fullName
        ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
        : email?.split("@")[0] || "User"

      user = await db.user.create({
        data: {
          email: email || `${appleUser.sub}@privaterelay.appleid.com`,
          name: userName,
          password: "", // No password for Apple Sign In
          role: "PARENT", // Default role
          emailVerified: new Date(),
          accounts: {
            create: {
              type: "oauth",
              provider: "apple",
              providerAccountId: appleUser.sub,
              id_token: identityToken,
              access_token: authorizationCode,
            },
          },
        },
      })
    }

    // Generate JWT token for iOS app
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" } // 30 days expiration
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      isNewUser,
    })
  } catch (error: any) {
    console.error("Apple auth error:", error)
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}
