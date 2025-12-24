import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-helper'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

// GET /api/auth/me - Fetch current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user with team memberships
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        teamMemberships: {
          include: {
            team: true,
          },
          where: {
            team: {
              active: true,
            },
          },
        },
      },
    })

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the first active team (if any)
    const primaryTeam = fullUser.teamMemberships[0]?.team || null

    return NextResponse.json({
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      image: fullUser.image,
      emailVerified: fullUser.emailVerified,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
      team: primaryTeam ? {
        id: primaryTeam.id,
        name: primaryTeam.name,
        season: primaryTeam.season,
        joinCode: primaryTeam.joinCode,
        logoUrl: primaryTeam.logoUrl,
        colors: primaryTeam.colors,
        ageGroup: primaryTeam.ageGroup,
        active: primaryTeam.active,
        createdAt: primaryTeam.createdAt,
        updatedAt: primaryTeam.updatedAt,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/auth/me - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role } = body

    // Build update data - only include fields that were provided
    const updateData: { name?: string; role?: UserRole } = {}

    if (name !== undefined) {
      // Validate name
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        )
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Name must be 100 characters or less' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (role !== undefined) {
      // Validate role against allowed values
      const allowedRoles: UserRole[] = [
        UserRole.HEAD_COACH,
        UserRole.ASSISTANT_COACH,
        UserRole.TEAM_MANAGER,
        UserRole.PARENT,
        UserRole.PLAYER,
      ]
      if (!allowedRoles.includes(role as UserRole)) {
        return NextResponse.json(
          { error: `Role must be one of: ${allowedRoles.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.role = role as UserRole
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        teamMemberships: {
          include: {
            team: true,
          },
          where: {
            team: {
              active: true,
            },
          },
        },
      },
      data: updateData,
    })

    // Get the first active team (if any)
    const primaryTeam = updatedUser.teamMemberships[0]?.team || null

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      image: updatedUser.image,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      team: primaryTeam ? {
        id: primaryTeam.id,
        name: primaryTeam.name,
        season: primaryTeam.season,
        joinCode: primaryTeam.joinCode,
        logoUrl: primaryTeam.logoUrl,
        colors: primaryTeam.colors,
        ageGroup: primaryTeam.ageGroup,
        active: primaryTeam.active,
        createdAt: primaryTeam.createdAt,
        updatedAt: primaryTeam.updatedAt,
      } : null,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
