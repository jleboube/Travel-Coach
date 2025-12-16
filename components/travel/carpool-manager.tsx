"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Car, Plus, Trash2, Users, Phone, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Carpool {
  id: string
  driverName: string
  driverPhone?: string | null
  seatsOffered: number
  passengers: string[]
}

interface CarpoolManagerProps {
  tournamentId: string
  carpools: Carpool[]
}

export function CarpoolManager({ tournamentId, carpools }: CarpoolManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    driverName: "",
    driverPhone: "",
    seatsOffered: "4",
    passengers: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const passengers = formData.passengers
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const response = await fetch(`/api/tournaments/${tournamentId}/carpools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: formData.driverName,
          driverPhone: formData.driverPhone || null,
          seatsOffered: formData.seatsOffered,
          passengers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create carpool')
      }

      toast({
        title: "Carpool added",
        description: `${formData.driverName}'s carpool has been added.`,
      })

      setFormData({
        driverName: "",
        driverPhone: "",
        seatsOffered: "4",
        passengers: "",
      })
      setShowForm(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add carpool. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (carpoolId: string) => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/carpools?carpoolId=${carpoolId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete carpool')
      }

      toast({
        title: "Carpool removed",
        description: "The carpool has been removed successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove carpool. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalSeats = carpools.reduce((sum, c) => sum + c.seatsOffered, 0)
  const filledSeats = carpools.reduce((sum, c) => sum + c.passengers.length, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Carpool Coordination
            </CardTitle>
            <CardDescription>
              Organize transportation for the tournament
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancel" : "Add Carpool"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {carpools.length > 0 && (
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{carpools.length} Carpool{carpools.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {filledSeats} / {totalSeats} Seats Filled
              </span>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name *</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, driverName: e.target.value }))
                  }
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverPhone">Driver Phone</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, driverPhone: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatsOffered">Seats Offered *</Label>
                <Input
                  id="seatsOffered"
                  type="number"
                  min="1"
                  value={formData.seatsOffered}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, seatsOffered: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers (comma-separated)</Label>
                <Input
                  id="passengers"
                  value={formData.passengers}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, passengers: e.target.value }))
                  }
                  placeholder="Player 1, Player 2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Carpool
              </Button>
            </div>
          </form>
        )}

        {carpools.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No carpools added yet</p>
            <p className="text-sm">Click "Add Carpool" to get started</p>
          </div>
        )}

        {carpools.length > 0 && (
          <div className="space-y-3">
            {carpools.map((carpool) => {
              const availableSeats = carpool.seatsOffered - carpool.passengers.length
              return (
                <div
                  key={carpool.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{carpool.driverName}</h4>
                      {availableSeats > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {availableSeats} seat{availableSeats !== 1 ? 's' : ''} available
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Full</Badge>
                      )}
                    </div>

                    {carpool.driverPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{carpool.driverPhone}</span>
                      </div>
                    )}

                    {carpool.passengers.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Passengers:</span>
                        <span>{carpool.passengers.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove carpool?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {carpool.driverName}'s carpool. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(carpool.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
