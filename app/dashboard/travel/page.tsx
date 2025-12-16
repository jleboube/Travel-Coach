import { redirect } from "next/navigation"
import { auth } from "@/auth"

import { db } from "@/lib/db"
import { TournamentCard } from "@/components/travel/tournament-card"
import { TournamentFormDialog } from "@/components/travel/tournament-form-dialog"
import { TravelUpload } from "@/components/travel/travel-upload"
import { UpcomingEventsList } from "@/components/travel/upcoming-events-list"
import { MapPin } from "lucide-react"

export const metadata = {
  title: "Travel & Tournaments | CoachHub",
  description: "Manage tournament travel, carpools, and expenses",
}

export default async function TravelPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const tournaments = await db.tournament.findMany({
    include: {
      _count: {
        select: {
          carpools: true,
          expenses: true,
          events: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  })

  // Get all events that require travel (not just tournaments)
  const travelEvents = await db.event.findMany({
    where: {
      requiresTravel: true,
    },
    include: {
      tournament: true,
    },
    orderBy: {
      start: 'desc',
    },
  })

  const upcomingTournaments = tournaments.filter(
    t => new Date(t.endDate) >= new Date()
  )

  const pastTournaments = tournaments.filter(
    t => new Date(t.endDate) < new Date()
  )

  const upcomingEvents = travelEvents.filter(
    e => new Date(e.end) >= new Date()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel & Tournaments</h1>
          <p className="text-muted-foreground">
            Manage tournament travel logistics, carpools, and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <TravelUpload />
          <TournamentFormDialog />
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tournaments yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first tournament
          </p>
          <TournamentFormDialog />
        </div>
      ) : (
        <div className="space-y-8">
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Upcoming Travel Events</h2>
                <p className="text-sm text-muted-foreground">
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''} requiring travel. Click an event to add tournament details.
                </p>
              </div>
              <UpcomingEventsList events={upcomingEvents} />
            </div>
          )}

          {upcomingTournaments.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Tournament Details</h2>
                <p className="text-sm text-muted-foreground">
                  {upcomingTournaments.length} tournament{upcomingTournaments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            </div>
          )}

          {pastTournaments.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Past Tournaments</h2>
                <p className="text-sm text-muted-foreground">
                  {pastTournaments.length} tournament{pastTournaments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
