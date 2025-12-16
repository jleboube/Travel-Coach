"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"

interface TournamentFormDialogProps {
  tournament?: {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    location?: string | null
    entryFee?: number | null
    hotelName?: string | null
    hotelLink?: string | null
    hotelDeadline?: Date | string | null
    perDiem?: number | null
    budget?: number | null
    notes?: string | null
    itinerary?: string | null
  }
  trigger?: React.ReactNode | null
  eventId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TournamentFormDialog({
  tournament,
  trigger,
  eventId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: TournamentFormDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const [formData, setFormData] = useState({
    name: tournament?.name || "",
    startDate: tournament?.startDate
      ? new Date(tournament.startDate).toISOString().split('T')[0]
      : "",
    endDate: tournament?.endDate
      ? new Date(tournament.endDate).toISOString().split('T')[0]
      : "",
    location: tournament?.location || "",
    entryFee: tournament?.entryFee?.toString() || "",
    hotelName: tournament?.hotelName || "",
    hotelLink: tournament?.hotelLink || "",
    hotelDeadline: tournament?.hotelDeadline
      ? new Date(tournament.hotelDeadline).toISOString().split('T')[0]
      : "",
    perDiem: tournament?.perDiem?.toString() || "",
    budget: tournament?.budget?.toString() || "",
    notes: tournament?.notes || "",
    itinerary: tournament?.itinerary || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = tournament?.id
        ? `/api/tournaments/${tournament.id}`
        : '/api/tournaments'

      const method = tournament?.id ? 'PATCH' : 'POST'

      // Include eventId if creating a tournament from an event
      const payload = eventId
        ? { ...formData, eventId }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save tournament')
      }

      toast({
        title: tournament ? "Tournament updated" : "Tournament created",
        description: `${formData.name} has been ${tournament ? 'updated' : 'created'} successfully.`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tournament
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tournament ? "Edit Tournament" : "Create Tournament"}
          </DialogTitle>
          <DialogDescription>
            {tournament
              ? "Update the tournament details below."
              : "Add a new tournament with all the travel details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Spring Classic Tournament"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryFee">Entry Fee ($)</Label>
              <Input
                id="entryFee"
                name="entryFee"
                type="number"
                step="0.01"
                value={formData.entryFee}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input
                id="hotelName"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                placeholder="Hotel Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotelLink">Hotel Booking Link</Label>
              <Input
                id="hotelLink"
                name="hotelLink"
                type="url"
                value={formData.hotelLink}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotelDeadline">Hotel Booking Deadline</Label>
              <Input
                id="hotelDeadline"
                name="hotelDeadline"
                type="date"
                value={formData.hotelDeadline}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perDiem">Per Diem ($)</Label>
              <Input
                id="perDiem"
                name="perDiem"
                type="number"
                step="0.01"
                value={formData.perDiem}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the tournament..."
                rows={3}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="itinerary">Itinerary</Label>
              <Textarea
                id="itinerary"
                name="itinerary"
                value={formData.itinerary}
                onChange={handleChange}
                placeholder="Day-by-day schedule..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tournament ? "Update" : "Create"} Tournament
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
