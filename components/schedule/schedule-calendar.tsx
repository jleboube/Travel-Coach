"use client"

import { useState, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventDialog } from "./event-dialog"

export function ScheduleCalendar({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(
    initialEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: event.color || getEventColor(event.type),
      extendedProps: {
        type: event.type,
        location: event.location,
        description: event.description,
        opponent: event.opponent,
        governingBody: event.governingBody,
        requiresTravel: event.requiresTravel,
      },
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const calendarRef = useRef<any>(null)

  function getEventColor(type: string) {
    const colors: Record<string, string> = {
      PRACTICE: "#3b82f6",
      GAME: "#10b981",
      TOURNAMENT: "#8b5cf6",
      TEAM_MEETING: "#f59e0b",
      FUNDRAISER: "#ec4899",
      OFF_DAY: "#6b7280",
      INDIVIDUAL_LESSON: "#06b6d4",
    }
    return colors[type] || "#3b82f6"
  }

  function handleEventClick(clickInfo: any) {
    setSelectedEvent(clickInfo.event)
    setDialogOpen(true)
  }

  function handleDateSelect(selectInfo: any) {
    setSelectedEvent({
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay,
    })
    setDialogOpen(true)
  }

  function handleAddEvent() {
    setSelectedEvent(null)
    setDialogOpen(true)
  }

  async function handleSaveEvent(eventData: any) {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventData.title,
          type: eventData.type,
          start: new Date(eventData.start),
          end: new Date(eventData.end),
          location: eventData.location || null,
          description: eventData.description || null,
          opponent: eventData.opponent || null,
          governingBody: eventData.governingBody || "NA",
          requiresTravel: eventData.requiresTravel || false,
          allDay: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)
        throw new Error(errorData.error || "Failed to save event")
      }

      const savedEvent = await response.json()

      // Add the new event to the calendar
      const newCalendarEvent = {
        id: savedEvent.id,
        title: savedEvent.title,
        start: savedEvent.start,
        end: savedEvent.end,
        allDay: savedEvent.allDay,
        backgroundColor: savedEvent.color || getEventColor(savedEvent.type),
        extendedProps: {
          type: savedEvent.type,
          location: savedEvent.location,
          description: savedEvent.description,
          opponent: savedEvent.opponent,
          governingBody: savedEvent.governingBody,
          requiresTravel: savedEvent.requiresTravel,
        },
      }

      setEvents([...events, newCalendarEvent])
      setDialogOpen(false)

      // Refresh the calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi()
        calendarApi.refetchEvents()
      }
    } catch (error) {
      console.error("Error saving event:", error)
      alert(`Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Card className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          select={handleDateSelect}
          height="auto"
        />
      </Card>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        onSave={handleSaveEvent}
      />
    </div>
  )
}
