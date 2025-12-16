import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  // Get team config
  const teamConfig = await db.teamConfig.findFirst()

  // Get current user details
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and team configuration
        </p>
      </div>

      <SettingsForm
        user={user}
        teamConfig={teamConfig}
        isHeadCoach={session.user.role === 'HEAD_COACH'}
      />
    </div>
  )
}
