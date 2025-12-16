"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GameFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game?: any
  onSave: (data: any) => void
}

export function GameFormDialog({
  open,
  onOpenChange,
  game,
  onSave,
}: GameFormDialogProps) {
  const [formData, setFormData] = useState({
    opponent: "",
    homeAway: "HOME",
    date: "",
    score: "",
    opponentScore: "",
    result: "",
    notes: "",
  })

  useEffect(() => {
    if (game) {
      setFormData({
        opponent: game.opponent || "",
        homeAway: game.homeAway || "HOME",
        date: game.date ? new Date(game.date).toISOString().slice(0, 16) : "",
        score: game.score || "",
        opponentScore: game.opponentScore || "",
        result: game.result || "",
        notes: game.notes || "",
      })
    } else {
      setFormData({
        opponent: "",
        homeAway: "HOME",
        date: "",
        score: "",
        opponentScore: "",
        result: "",
        notes: "",
      })
    }
  }, [game, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{game ? "Edit Game" : "Add New Game"}</DialogTitle>
          <DialogDescription>
            {game ? "Update game information and results" : "Add a new game to your schedule"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="opponent">Opponent *</Label>
              <Input
                id="opponent"
                value={formData.opponent}
                onChange={(e) =>
                  setFormData({ ...formData, opponent: e.target.value })
                }
                placeholder="Enter opponent team name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="homeAway">Home/Away *</Label>
              <Select
                value={formData.homeAway}
                onValueChange={(value) =>
                  setFormData({ ...formData, homeAway: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">Home</SelectItem>
                  <SelectItem value="AWAY">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="score">Our Score</Label>
                <Input
                  id="score"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="opponentScore">Opponent Score</Label>
                <Input
                  id="opponentScore"
                  value={formData.opponentScore}
                  onChange={(e) =>
                    setFormData({ ...formData, opponentScore: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="result">Result</Label>
              <Select
                value={formData.result}
                onValueChange={(value) =>
                  setFormData({ ...formData, result: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Played</SelectItem>
                  <SelectItem value="W">Win</SelectItem>
                  <SelectItem value="L">Loss</SelectItem>
                  <SelectItem value="T">Tie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about the game..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Game</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
