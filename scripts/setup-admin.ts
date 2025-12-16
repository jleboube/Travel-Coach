#!/usr/bin/env tsx

/**
 * CoachHub Baseball - Admin Setup Script
 * Creates initial admin user and team configuration
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('CoachHub Baseball - Admin Setup')
  console.log('=================================\n')

  // Get environment variables or use defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachhub.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const teamName = process.env.TEAM_NAME || 'My Baseball Team'

  try {
    // Create admin user
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: 'Head Coach',
        password: hashedPassword,
        role: 'HEAD_COACH',
      },
    })

    console.log(`✓ Admin user created: ${admin.email}`)

    // Create team configuration
    console.log('\nCreating team configuration...')
    const teamConfig = await prisma.teamConfig.upsert({
      where: { id: 'default' },
      update: {
        teamName,
        season: '2025',
      },
      create: {
        id: 'default',
        teamName,
        season: '2025',
        colors: ['#1e40af', '#ffffff'],
        ageGroup: '12U',
      },
    })

    console.log(`✓ Team configuration created: ${teamConfig.teamName}`)

    // Create sample data (optional)
    console.log('\nCreating sample data...')

    // Sample player
    const player = await prisma.player.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        jerseyNumber: 12,
        positions: ['SS', 'P'],
        bats: 'R',
        throws: 'R',
        graduationYear: 2028,
        parentName: 'Jane Doe',
        parentPhone: '555-0123',
        parentEmail: 'parent@example.com',
      },
    })

    console.log(`✓ Sample player created: ${player.firstName} ${player.lastName} #${player.jerseyNumber}`)

    // Sample announcement
    const announcement = await prisma.announcement.create({
      data: {
        title: 'Welcome to CoachHub Baseball!',
        content: 'This is your team management platform. Explore the features and start managing your team efficiently.',
        priority: 'NORMAL',
        authorId: admin.id,
      },
    })

    console.log(`✓ Welcome announcement created`)

    console.log('\n=================================')
    console.log('Setup completed successfully!')
    console.log('\nLogin credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\n⚠️  Please change the admin password after first login!')
    console.log('\nAccess the application at: http://localhost:7373')

  } catch (error) {
    console.error('Error during setup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
