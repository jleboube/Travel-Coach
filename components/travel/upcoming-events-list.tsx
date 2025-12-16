"use client"

import { useState } from "react"
import { TournamentFormDialog } from "./tournament-form-dialog"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"

interface Event {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  location: string | null
  description: string | null
  governingBody: string | null
  tournament: any
}

interface UpcomingEventsListProps {
  events: Event[]
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedEvent(null)
  }

  // Pre-fill tournament data from the selected event
  const getTournamentDataFromEvent = (event: Event) => {
    return {
      name: event.title,
      startDate: event.start,
      endDate: event.end,
      location: event.location || "",
      notes: event.description || "",
    }
  }

  return (
    <>
      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleEventClick(event)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.start).toLocaleDateString()} -{" "}
                    {new Date(event.end).toLocaleDateString()}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.governingBody && event.governingBody !== "NA" && (
                  <p className="text-sm text-gray-600 mt-1">
                    Governing Body: {event.governingBody.replace("_", " ")}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {event.tournament ? (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Tournament Created
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    handleEventClick(event)
                  }}>
                    Add Tournament Details
                  </Button>
                )}
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {event.type.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <TournamentFormDialog
          tournament={getTournamentDataFromEvent(selectedEvent) as any}
          eventId={selectedEvent.id}
          trigger={null}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setSelectedEvent(null)
            }
          }}
        />
      )}
    </>
  )
}
