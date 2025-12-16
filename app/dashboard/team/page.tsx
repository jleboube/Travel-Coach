import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TeamManagement } from "@/components/team/team-management"

export default async function TeamPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only HEAD_COACH can access this page
  if (session.user.role !== "HEAD_COACH") {
    redirect("/dashboard")
  }

  // Get all team members
  const members = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: [
      { role: "asc" },
      { createdAt: "asc" },
    ],
  })

  // Get pending invitations
  const invitations = await db.invitation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { gte: new Date() },
    },
    include: {
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your coaching staff and team members
        </p>
      </div>

      <TeamManagement
        initialMembers={members}
        initialInvitations={invitations}
      />
    </div>
  )
}
