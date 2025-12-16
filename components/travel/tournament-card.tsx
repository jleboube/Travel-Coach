"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, DollarSign, Users, Car, Receipt } from "lucide-react"

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    startDate: Date | string
    endDate: Date | string
    location?: string | null
    entryFee?: number | null
    budget?: number | null
    _count?: {
      carpools: number
      expenses: number
      events: number
    }
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </CardDescription>
          </div>
          <Badge variant={isUpcoming ? "default" : isPast ? "secondary" : "outline"}>
            {isUpcoming ? "Upcoming" : isPast ? "Past" : "In Progress"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tournament.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{tournament.location}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {tournament.entryFee && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Entry: ${tournament.entryFee.toFixed(2)}</span>
            </div>
          )}

          {tournament.budget && (
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span>Budget: ${tournament.budget.toFixed(2)}</span>
            </div>
          )}
        </div>

        {tournament._count && (
          <div className="flex gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>{tournament._count.carpools} Carpool{tournament._count.carpools !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{tournament._count.events} Game{tournament._count.events !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/travel/${tournament.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
