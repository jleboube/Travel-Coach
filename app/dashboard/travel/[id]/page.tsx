import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"

import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TournamentFormDialog } from "@/components/travel/tournament-form-dialog"
import { CarpoolManager } from "@/components/travel/carpool-manager"
import { ExpenseTracker } from "@/components/travel/expense-tracker"
import { formatDate } from "@/lib/utils"
import {
  Calendar,
  MapPin,
  DollarSign,
  Hotel,
  ExternalLink,
  Download,
  Edit,
  FileText,
  Users,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Tournament Details | CoachHub",
  description: "View and manage tournament details",
}

interface TournamentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      carpools: {
        orderBy: { driverName: 'asc' },
      },
      expenses: {
        orderBy: { date: 'desc' },
      },
      events: {
        orderBy: { start: 'asc' },
        include: {
          rsvps: true,
        },
      },
    },
  })

  if (!tournament) {
    notFound()
  }

  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()

  const totalExpenses = tournament.expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalSeats = tournament.carpools.reduce((sum, c) => sum + c.seatsOffered, 0)
  const filledSeats = tournament.carpools.reduce((sum, c) => sum + c.passengers.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            <Badge variant={isUpcoming ? "default" : isPast ? "secondary" : "outline"}>
              {isUpcoming ? "Upcoming" : isPast ? "Past" : "In Progress"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <TournamentFormDialog
            tournament={tournament}
            trigger={
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            }
          />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {tournament.location || "Not specified"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Entry Fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {tournament.entryFee ? `$${tournament.entryFee.toFixed(2)}` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {tournament.events.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {(tournament.hotelName || tournament.perDiem || tournament.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tournament Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournament.hotelName && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">Hotel Block</h4>
                </div>
                <div className="space-y-2 ml-6">
                  <p className="text-sm">{tournament.hotelName}</p>
                  {tournament.hotelLink && (
                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                      <a href={tournament.hotelLink} target="_blank" rel="noopener noreferrer">
                        Booking Link
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {tournament.hotelDeadline && (
                    <p className="text-sm text-muted-foreground">
                      Deadline: {formatDate(tournament.hotelDeadline)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {tournament.perDiem && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">Per Diem</h4>
                </div>
                <p className="text-sm ml-6">${tournament.perDiem.toFixed(2)} per day</p>
              </div>
            )}

            {tournament.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap ml-6">
                  {tournament.notes}
                </p>
              </div>
            )}

            {tournament.budget && (
              <div>
                <h4 className="font-semibold mb-2">Budget</h4>
                <p className="text-sm ml-6">
                  ${tournament.budget.toFixed(2)}
                  {totalExpenses > 0 && (
                    <span className={totalExpenses > tournament.budget ? "text-red-600 ml-2" : "text-green-600 ml-2"}>
                      ({totalExpenses > tournament.budget ? 'Over' : 'Under'} by ${Math.abs(tournament.budget - totalExpenses).toFixed(2)})
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="carpools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carpools">
            Carpools ({tournament.carpools.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses ({tournament.expenses.length})
          </TabsTrigger>
          {tournament.itinerary && (
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          )}
          {tournament.events.length > 0 && (
            <TabsTrigger value="schedule">
              Schedule ({tournament.events.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="carpools">
          <CarpoolManager
            tournamentId={tournament.id}
            carpools={tournament.carpools}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseTracker
            tournamentId={tournament.id}
            expenses={tournament.expenses}
            budget={tournament.budget}
          />
        </TabsContent>

        {tournament.itinerary && (
          <TabsContent value="itinerary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tournament Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {tournament.itinerary}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {tournament.events.length > 0 && (
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Game Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tournament.events.map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.start)}
                          </p>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.opponent && (
                            <p className="text-sm">vs. {event.opponent}</p>
                          )}
                        </div>
                      </div>
                      {event.rsvps.length > 0 && (
                        <Badge variant="outline">
                          {event.rsvps.filter(r => r.status === 'YES').length} attending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/dashboard/travel">
            Back to Tournaments
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(tournament.updatedAt)}
        </p>
      </div>
    </div>
  )
}
