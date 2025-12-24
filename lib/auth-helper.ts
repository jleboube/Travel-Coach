import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  role: string
}

/**
 * Unified auth helper that supports both:
 * 1. NextAuth session (for web)
 * 2. JWT Bearer token (for iOS app)
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  // Try NextAuth session first (for web)
  const session = await auth()
  if (session?.user) {
    return {
      id: session.user.id!,
      email: session.user.email!,
      name: session.user.name!,
      role: (session.user as any).role || 'PARENT',
    }
  }

  // If no session, try JWT Bearer token (for iOS)
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

        // Fetch user from database to ensure they still exist
        const user = await db.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        })

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }
      } catch (error) {
        console.error('JWT verification failed:', error)
        return null
      }
    }
  }

  return null
}
