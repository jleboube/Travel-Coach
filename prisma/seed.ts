import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachhub.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const teamName = process.env.TEAM_NAME || 'Sample Team'

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Create admin user (HEAD_COACH has full permissions)
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'HEAD_COACH',
    },
  })

  console.log('Admin user created:', admin.email)

  // Create team config
  const teamConfig = await prisma.teamConfig.create({
    data: {
      teamName,
      season: new Date().getFullYear().toString(),
      logoUrl: null,
      colors: [],
      ageGroup: null,
    },
  })

  console.log('Team configuration created:', teamConfig.teamName)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
