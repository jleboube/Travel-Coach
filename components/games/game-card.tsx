"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, TrendingUp, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface GameCardProps {
  game: {
    id: string
    opponent: string
    homeAway: string
    date: string | Date
    score?: string | null
    opponentScore?: string | null
    result?: string | null
    notes?: string | null
    event?: {
      type: string
      title?: string
      location?: string | null
    }
  }
  onEdit?: () => void
  onDelete?: () => void
}

export function GameCard({ game, onEdit, onDelete }: GameCardProps) {
  const getResultBadge = () => {
    if (!game.result) return null

    const variant =
      game.result === "W" ? "default" :
      game.result === "L" ? "destructive" :
      "secondary"

    return <Badge variant={variant}>{game.result}</Badge>
  }

  const getScoreDisplay = () => {
    if (game.score && game.opponentScore) {
      return `${game.score} - ${game.opponentScore}`
    }
    return "TBD"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {game.event?.title || `vs ${game.opponent}`}
              </h3>
              {game.event?.type && (
                <Badge variant="outline" className="text-xs">
                  {game.event.type.replace("_", " ")}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(game.date)}
            </div>
          </div>
          {getResultBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {game.event?.location || (game.homeAway === "HOME" ? "Home" : "Away")}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Score: {getScoreDisplay()}</span>
        </div>

        {game.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {game.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        <Button asChild variant="default" className="flex-1">
          <Link href={`/dashboard/games/${game.id}`}>
            View Details
          </Link>
        </Button>
        {onEdit && (
          <Button onClick={onEdit} variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button onClick={onDelete} variant="outline" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
