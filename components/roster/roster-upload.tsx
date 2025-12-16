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

interface ParsedPlayer {
  firstName: string
  lastName: string
  jerseyNumber: number
  positions: string[]
  bats: string
  throws: string
  graduationYear: number
  birthDate?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  active?: boolean
}

export function RosterUpload() {
  const [open, setOpen] = useState(false)
  const [parsedPlayers, setParsedPlayers] = useState<ParsedPlayer[]>([])
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dataType", "roster")

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
          title: "No players found",
          description: "The document doesn't contain any roster data we could parse.",
          variant: "destructive",
        })
        return
      }

      setParsedPlayers(result.data)
      toast({
        title: "Document parsed successfully",
        description: `Found ${result.recordCount} player(s). Review and import them below.`,
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

      for (const player of parsedPlayers) {
        try {
          const response = await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(player),
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
        description: `Successfully imported ${successCount} player(s).${failCount > 0 ? ` Failed to import ${failCount}.` : ""}`,
      })

      setOpen(false)
      setParsedPlayers([])
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import players",
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
          Import Roster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Roster from Document</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet containing your team roster. Our AI will automatically
            extract player information and prepare it for import.
          </DialogDescription>
        </DialogHeader>

        {parsedPlayers.length === 0 ? (
          <DocumentUpload
            onUpload={handleUpload}
            description="Upload your roster spreadsheet"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Found {parsedPlayers.length} player(s) - Review before importing:
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parsedPlayers.map((player, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        #{player.jerseyNumber} - {player.firstName} {player.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Positions: {player.positions.join(", ")}</div>
                        <div>Bats: {player.bats} / Throws: {player.throws}</div>
                        <div>Graduation: {player.graduationYear}</div>
                        {player.parentEmail && <div>Parent: {player.parentEmail}</div>}
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
                {importing ? "Importing..." : `Import ${parsedPlayers.length} Player(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedPlayers([])}
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
