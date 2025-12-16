"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/hooks/use-toast"
import { formatDateTime } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  TrendingUp,
  Edit,
  BarChart3,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { GameFormDialog } from "@/components/games/game-form-dialog"

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGame()
  }, [id])

  async function fetchGame() {
    try {
      const response = await fetch(`/api/games/${id}`)
      if (!response.ok) throw new Error("Failed to fetch game")
      const data = await response.json()
      setGame(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load game details",
        variant: "destructive",
      })
      router.push("/dashboard/games")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateGame(formData: any) {
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update game")

      toast({
        title: "Success",
        description: "Game updated successfully",
      })

      setDialogOpen(false)
      fetchGame()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!game) {
    return null
  }

  const getResultBadge = () => {
    if (!game.result) return null

    const variant =
      game.result === "W" ? "default" :
      game.result === "L" ? "destructive" :
      "secondary"

    const text =
      game.result === "W" ? "Win" :
      game.result === "L" ? "Loss" :
      "Tie"

    return <Badge variant={variant}>{text}</Badge>
  }

  const getScoreDisplay = () => {
    if (game.score && game.opponentScore) {
      return `${game.score} - ${game.opponentScore}`
    }
    return "TBD"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/games">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              vs {game.opponent}
            </h1>
            <p className="text-muted-foreground">Game Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Game
          </Button>
          <Button asChild>
            <Link href={`/dashboard/games/${id}/stats`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Enter Stats
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{formatDateTime(game.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location:</span>
              <span>{game.homeAway === "HOME" ? "Home" : "Away"}</span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Opponent:</span>
              <span>{game.opponent}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score & Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Final Score:</span>
              <span className="text-2xl font-bold">{getScoreDisplay()}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium">Result:</span>
              {getResultBadge() || <span className="text-muted-foreground">Not played</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {game.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {game.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {game.playerStats && game.playerStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {game.playerStats.length} player(s) have recorded stats
            </div>
            <Button variant="link" className="px-0" asChild>
              <Link href={`/dashboard/games/${id}/stats`}>
                View and edit statistics
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <GameFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        game={game}
        onSave={handleUpdateGame}
      />
    </div>
  )
}
