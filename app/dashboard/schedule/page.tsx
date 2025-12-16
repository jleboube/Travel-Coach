import { ScheduleCalendar } from "@/components/schedule/schedule-calendar"
import { ScheduleUpload } from "@/components/schedule/schedule-upload"
import { db } from "@/lib/db"

export default async function SchedulePage() {
  const events = await db.event.findMany({
    orderBy: { start: "asc" },
    include: {
      rsvps: true,
      tournament: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">
            Manage team practices, games, and events
          </p>
        </div>
        <ScheduleUpload />
      </div>

      <ScheduleCalendar initialEvents={events} />
    </div>
  )
}
