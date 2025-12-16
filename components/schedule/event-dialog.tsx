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

const EVENT_TYPES = [
  { value: "PRACTICE", label: "Practice" },
  { value: "GAME", label: "Game" },
  { value: "TOURNAMENT", label: "Tournament" },
  { value: "TEAM_MEETING", label: "Team Meeting" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "OFF_DAY", label: "Off Day" },
  { value: "INDIVIDUAL_LESSON", label: "Individual Lesson" },
]

const GOVERNING_BODIES = [
  { value: "NA", label: "N/A" },
  { value: "PBR", label: "PBR" },
  { value: "USSSA", label: "USSSA" },
  { value: "JP_SPORTS", label: "JP Sports" },
  { value: "PG", label: "PG" },
  { value: "GAMEDAY", label: "Gameday" },
]

export function EventDialog({
  open,
  onOpenChange,
  event,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: any
  onSave: (event: any) => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "PRACTICE",
    start: "",
    end: "",
    location: "",
    description: "",
    opponent: "",
    governingBody: "NA",
    requiresTravel: false,
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        type: event.extendedProps?.type || "PRACTICE",
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : "",
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : "",
        location: event.extendedProps?.location || "",
        description: event.extendedProps?.description || "",
        opponent: event.extendedProps?.opponent || "",
        governingBody: event.extendedProps?.governingBody || "NA",
        requiresTravel: event.extendedProps?.requiresTravel || false,
      })
    } else {
      setFormData({
        title: "",
        type: "PRACTICE",
        start: "",
        end: "",
        location: "",
        description: "",
        opponent: "",
        governingBody: "NA",
        requiresTravel: false,
      })
    }
  }, [event])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            Add or edit team events, practices, and games
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date/Time</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date/Time</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            {formData.type === "GAME" && (
              <div className="grid gap-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="governingBody">Governing Body</Label>
              <Select
                value={formData.governingBody}
                onValueChange={(value) => setFormData({ ...formData, governingBody: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOVERNING_BODIES.map((body) => (
                    <SelectItem key={body.value} value={body.value}>
                      {body.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  id="requiresTravel"
                  type="checkbox"
                  checked={formData.requiresTravel}
                  onChange={(e) => setFormData({ ...formData, requiresTravel: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="requiresTravel" className="cursor-pointer">
                  Requires Travel
                </Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
