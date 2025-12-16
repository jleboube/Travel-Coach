import { db } from "@/lib/db"
import { AnnouncementsList } from "@/components/announcements/announcements-list"
import { auth } from "@/auth"

import { redirect } from "next/navigation"

export default async function AnnouncementsPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-gray-600">
            Team updates and important notifications
          </p>
        </div>
      </div>

      <AnnouncementsList initialAnnouncements={announcements} userRole={session.user.role as string} />
    </div>
  )
}
