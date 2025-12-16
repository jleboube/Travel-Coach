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

interface ParsedTournament {
  name: string
  startDate: string
  endDate: string
  location?: string
  entryFee?: number
  hotelName?: string
  hotelLink?: string
  hotelDeadline?: string
  perDiem?: number
  budget?: number
  notes?: string
  itinerary?: string
}

export function TravelUpload() {
  const [open, setOpen] = useState(false)
  const [parsedTournaments, setParsedTournaments] = useState<ParsedTournament[]>([])
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dataType", "travel")

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
          title: "No tournaments found",
          description: "The document doesn't contain any tournament data we could parse.",
          variant: "destructive",
        })
        return
      }

      setParsedTournaments(result.data)
      toast({
        title: "Document parsed successfully",
        description: `Found ${result.recordCount} tournament(s). Review and import them below.`,
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

      for (const tournament of parsedTournaments) {
        try {
          const response = await fetch("/api/tournaments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tournament),
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
        description: `Successfully imported ${successCount} tournament(s).${failCount > 0 ? ` Failed to import ${failCount}.` : ""}`,
      })

      setOpen(false)
      setParsedTournaments([])
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import tournaments",
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
          <DialogTitle>Import Tournaments from Document</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet containing tournament information. Our AI will automatically
            extract tournament details and prepare them for import.
          </DialogDescription>
        </DialogHeader>

        {parsedTournaments.length === 0 ? (
          <DocumentUpload
            onUpload={handleUpload}
            description="Upload your tournament information"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Found {parsedTournaments.length} tournament(s) - Review before importing:
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parsedTournaments.map((tournament, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{tournament.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>
                          {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                        </div>
                        {tournament.location && <div>Location: {tournament.location}</div>}
                        {tournament.entryFee && <div>Entry Fee: ${tournament.entryFee.toFixed(2)}</div>}
                        {tournament.hotelName && <div>Hotel: {tournament.hotelName}</div>}
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
                {importing ? "Importing..." : `Import ${parsedTournaments.length} Tournament(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedTournaments([])}
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
