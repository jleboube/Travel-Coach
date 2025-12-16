"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/games/game-card"
import { GameFormDialog } from "@/components/games/game-form-dialog"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchGames()
  }, [])

  async function fetchGames() {
    try {
      const response = await fetch("/api/games")
      if (!response.ok) throw new Error("Failed to fetch games")
      const data = await response.json()
      setGames(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveGame(formData: any) {
    try {
      const url = editingGame
        ? `/api/games/${editingGame.id}`
        : "/api/games"
      const method = editingGame ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save game")

      toast({
        title: "Success",
        description: editingGame
          ? "Game updated successfully"
          : "Game created successfully",
      })

      setDialogOpen(false)
      setEditingGame(null)
      fetchGames()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save game",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteGame() {
    if (!gameToDelete) return

    try {
      const response = await fetch(`/api/games/${gameToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete game")

      toast({
        title: "Success",
        description: "Game deleted successfully",
      })

      setDeleteDialogOpen(false)
      setGameToDelete(null)
      fetchGames()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive",
      })
    }
  }

  function openEditDialog(game: any) {
    setEditingGame(game)
    setDialogOpen(true)
  }

  function openDeleteDialog(gameId: string) {
    setGameToDelete(gameId)
    setDeleteDialogOpen(true)
  }

  function openNewGameDialog() {
    setEditingGame(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground">
            Manage your team's game schedule and results
          </p>
        </div>
        <Button onClick={openNewGameDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No games scheduled yet</p>
          <Button onClick={openNewGameDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Game
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={() => openEditDialog(game)}
              onDelete={() => openDeleteDialog(game.id)}
            />
          ))}
        </div>
      )}

      <GameFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        game={editingGame}
        onSave={handleSaveGame}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the game
              and all associated stats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
