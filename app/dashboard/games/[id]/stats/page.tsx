"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatEntryForm } from "@/components/games/stat-entry-form"
import { useToast } from "@/components/ui/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function GameStatsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [game, setGame] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [gameRes, playersRes, statsRes] = await Promise.all([
        fetch(`/api/games/${id}`),
        fetch("/api/players"),
        fetch(`/api/games/${id}/stats`),
      ])

      if (!gameRes.ok || !playersRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const [gameData, playersData, statsData] = await Promise.all([
        gameRes.json(),
        playersRes.json(),
        statsRes.json(),
      ])

      setGame(gameData)
      setPlayers(playersData.filter((p: any) => p.active))
      setStats(statsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load game stats",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveStats(statsData: any[]) {
    try {
      const response = await fetch(`/api/games/${id}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: statsData }),
      })

      if (!response.ok) throw new Error("Failed to save stats")

      toast({
        title: "Success",
        description: "Game statistics saved successfully",
      })

      router.push(`/dashboard/games/${id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save statistics",
        variant: "destructive",
      })
    }
  }

  function handleCancel() {
    router.push(`/dashboard/games/${id}`)
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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/games/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enter Game Stats
          </h1>
          <p className="text-muted-foreground">
            vs {game.opponent} - {new Date(game.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No active players found. Add players to your roster first.
          </p>
          <Button asChild>
            <Link href="/dashboard/roster">Go to Roster</Link>
          </Button>
        </div>
      ) : (
        <StatEntryForm
          players={players}
          initialStats={stats}
          onSave={handleSaveStats}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
