"use client"

import { useState } from "react"
import { DocumentUpload } from "@/components/ui/document-upload"
import { useToast } from "@/components/ui/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Check, X } from "lucide-react"

interface ParsedEvent {
  title: string
  type: string
  start: string
  end: string
  allDay?: boolean
  location?: string
  locationUrl?: string
  description?: string
  opponent?: string
  governingBody?: string
  requiresTravel?: boolean
}

export function ScheduleUpload() {
  const [open, setOpen] = useState(false)
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([])
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dataType", "schedule")

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to parse document")
      }

      const result = await response.json()

      if (result.recordCount === 0) {
        toast({
          title: "No events found",
          description: "The document doesn't contain any schedule data we could parse.",
          variant: "destructive",
        })
        return
      }

      setParsedEvents(result.data)
      toast({
        title: "Document parsed successfully",
        description: `Found ${result.recordCount} event(s). Review and import them below.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to parse document",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      let successCount = 0
      let failCount = 0

      for (const event of parsedEvents) {
        try {
          const response = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      toast({
        title: "Import complete",
        description: `Successfully imported ${successCount} event(s).${failCount > 0 ? ` Failed to import ${failCount}.` : ""}`,
      })

      setOpen(false)
      setParsedEvents([])
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import events",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import from File
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Schedule from Document</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet or document containing your schedule. Our AI will automatically
            extract event information and prepare it for import.
          </DialogDescription>
        </DialogHeader>

        {parsedEvents.length === 0 ? (
          <DocumentUpload
            onUpload={handleUpload}
            description="Upload your schedule spreadsheet"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Found {parsedEvents.length} event(s) - Review before importing:
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parsedEvents.map((event, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Type: <span className="font-medium">{event.type}</span></div>
                        <div>
                          {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                        </div>
                        {event.location && <div>Location: {event.location}</div>}
                        {event.opponent && <div>Opponent: {event.opponent}</div>}
                      </div>
                    </div>
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="flex-1"
              >
                {importing ? "Importing..." : `Import ${parsedEvents.length} Event(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedEvents([])}
                disabled={importing}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
