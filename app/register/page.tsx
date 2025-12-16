import { RegisterForm } from "@/components/auth/register-form"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  // If no token provided, redirect to login
  if (!token) {
    redirect("/login")
  }

  // Verify the invitation token
  const invitation = await db.invitation.findUnique({
    where: { token },
  })

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-4">
            This invitation link is not valid. Please contact your team administrator.
          </p>
        </div>
      </div>
    )
  }

  // Check if invitation is still valid
  if (invitation.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Already Used</h1>
          <p className="text-gray-600 mb-4">
            This invitation has already been used or cancelled.
          </p>
        </div>
      </div>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-4">
            This invitation link has expired. Please request a new invitation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <RegisterForm invitation={invitation} />
      </div>
    </div>
  )
}
