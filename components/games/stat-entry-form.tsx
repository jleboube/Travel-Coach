"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Player {
  id: string
  firstName: string
  lastName: string
  jerseyNumber: number
}

interface PlayerStat {
  playerId: string
  ab: number
  h: number
  doubles: number
  triples: number
  hr: number
  rbi: number
  bb: number
  k: number
  ip: number
  pitchingH: number
  r: number
  er: number
  pitchingBB: number
  pitchingK: number
  po: number
  a: number
  e: number
}

interface StatEntryFormProps {
  players: Player[]
  initialStats?: any[]
  onSave: (stats: PlayerStat[]) => void
  onCancel: () => void
}

export function StatEntryForm({
  players,
  initialStats = [],
  onSave,
  onCancel,
}: StatEntryFormProps) {
  const [stats, setStats] = useState<Record<string, PlayerStat>>({})
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")

  useEffect(() => {
    // Initialize stats from existing data or create empty stats for all players
    const initialStatsMap: Record<string, PlayerStat> = {}

    players.forEach((player) => {
      const existingStat = initialStats.find((s) => s.playerId === player.id)
      initialStatsMap[player.id] = existingStat || {
        playerId: player.id,
        ab: 0,
        h: 0,
        doubles: 0,
        triples: 0,
        hr: 0,
        rbi: 0,
        bb: 0,
        k: 0,
        ip: 0,
        pitchingH: 0,
        r: 0,
        er: 0,
        pitchingBB: 0,
        pitchingK: 0,
        po: 0,
        a: 0,
        e: 0,
      }
    })

    setStats(initialStatsMap)
    if (players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0].id)
    }
  }, [players, initialStats])

  const updateStat = (playerId: string, field: keyof PlayerStat, value: string) => {
    setStats((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: field === "ip" ? parseFloat(value) || 0 : parseInt(value) || 0,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const statsArray = Object.values(stats)
    onSave(statsArray)
  }

  const currentPlayer = players.find((p) => p.id === selectedPlayer)
  const currentStats = stats[selectedPlayer] || {}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Player Selection - Mobile Optimized */}
      <div className="space-y-2">
        <Label>Select Player</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {players.map((player) => (
            <Button
              key={player.id}
              type="button"
              variant={selectedPlayer === player.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setSelectedPlayer(player.id)}
            >
              #{player.jerseyNumber} {player.firstName} {player.lastName}
            </Button>
          ))}
        </div>
      </div>

      {currentPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>
              Stats for #{currentPlayer.jerseyNumber} {currentPlayer.firstName}{" "}
              {currentPlayer.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hitting" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hitting">Hitting</TabsTrigger>
                <TabsTrigger value="pitching">Pitching</TabsTrigger>
                <TabsTrigger value="fielding">Fielding</TabsTrigger>
              </TabsList>

              <TabsContent value="hitting" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ab">AB</Label>
                    <Input
                      id="ab"
                      type="number"
                      min="0"
                      value={currentStats.ab || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "ab", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="h">H</Label>
                    <Input
                      id="h"
                      type="number"
                      min="0"
                      value={currentStats.h || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "h", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doubles">2B</Label>
                    <Input
                      id="doubles"
                      type="number"
                      min="0"
                      value={currentStats.doubles || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "doubles", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triples">3B</Label>
                    <Input
                      id="triples"
                      type="number"
                      min="0"
                      value={currentStats.triples || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "triples", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hr">HR</Label>
                    <Input
                      id="hr"
                      type="number"
                      min="0"
                      value={currentStats.hr || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "hr", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rbi">RBI</Label>
                    <Input
                      id="rbi"
                      type="number"
                      min="0"
                      value={currentStats.rbi || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "rbi", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bb">BB</Label>
                    <Input
                      id="bb"
                      type="number"
                      min="0"
                      value={currentStats.bb || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "bb", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="k">K</Label>
                    <Input
                      id="k"
                      type="number"
                      min="0"
                      value={currentStats.k || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "k", e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pitching" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip">IP</Label>
                    <Input
                      id="ip"
                      type="number"
                      step="0.1"
                      min="0"
                      value={currentStats.ip || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "ip", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pitchingH">H</Label>
                    <Input
                      id="pitchingH"
                      type="number"
                      min="0"
                      value={currentStats.pitchingH || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "pitchingH", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r">R</Label>
                    <Input
                      id="r"
                      type="number"
                      min="0"
                      value={currentStats.r || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "r", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="er">ER</Label>
                    <Input
                      id="er"
                      type="number"
                      min="0"
                      value={currentStats.er || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "er", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pitchingBB">BB</Label>
                    <Input
                      id="pitchingBB"
                      type="number"
                      min="0"
                      value={currentStats.pitchingBB || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "pitchingBB", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pitchingK">K</Label>
                    <Input
                      id="pitchingK"
                      type="number"
                      min="0"
                      value={currentStats.pitchingK || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "pitchingK", e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fielding" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="po">PO</Label>
                    <Input
                      id="po"
                      type="number"
                      min="0"
                      value={currentStats.po || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "po", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="a">A</Label>
                    <Input
                      id="a"
                      type="number"
                      min="0"
                      value={currentStats.a || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "a", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e">E</Label>
                    <Input
                      id="e"
                      type="number"
                      min="0"
                      value={currentStats.e || 0}
                      onChange={(e) =>
                        updateStat(selectedPlayer, "e", e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 justify-end sticky bottom-0 bg-background p-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save All Stats</Button>
      </div>
    </form>
  )
}
