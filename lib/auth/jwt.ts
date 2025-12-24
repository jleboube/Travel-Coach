import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string | null
  role: string
  iat: number
  exp: number
}

/**
 * Verify and decode a JWT token from the Authorization header
 */
export async function verifyJWT(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

/**
 * Get authenticated user from either NextAuth session or JWT token
 */
export async function getAuthenticatedUser(request: NextRequest) {
  // First try JWT (for iOS app)
  const jwtPayload = await verifyJWT(request)

  if (jwtPayload) {
    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      role: jwtPayload.role,
    }
  }

  // Otherwise try NextAuth session (for web app)
  const { auth } = await import("@/auth")
  const session = await auth()

  if (session?.user) {
    return {
      userId: session.user.id,
      email: session.user.email || null,
      role: session.user.role,
    }
  }

  return null
}
