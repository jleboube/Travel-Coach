"use client"

import { useState } from "react"
import { DocumentUpload } from "@/components/ui/document-upload"
import { useToast } from "@/components/ui/hooks/use-toast"
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

interface ParsedWorkout {
  title: string
  frequency: string
  ageMin?: number
  ageMax?: number
  duration: number
  programDuration?: number
  programDurationUnit?: string
  focus: string[]
  description?: string
  active?: boolean
}

interface WorkoutUploadProps {
  onImportComplete: () => void
}

export function WorkoutUpload({ onImportComplete }: WorkoutUploadProps) {
  const [open, setOpen] = useState(false)
  const [parsedWorkouts, setParsedWorkouts] = useState<ParsedWorkout[]>([])
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dataType", "workouts")

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
          title: "No workouts found",
          description: "The document doesn't contain any workout data we could parse.",
          variant: "destructive",
        })
        return
      }

      setParsedWorkouts(result.data)
      toast({
        title: "Document parsed successfully",
        description: `Found ${result.recordCount} workout(s). Review and import them below.`,
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

      for (const workout of parsedWorkouts) {
        try {
          const response = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workout),
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
        description: `Successfully imported ${successCount} workout(s).${failCount > 0 ? ` Failed to import ${failCount}.` : ""}`,
      })

      setOpen(false)
      setParsedWorkouts([])
      onImportComplete()
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import workouts",
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
          <DialogTitle>Import Workouts from Document</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet containing workout programs. Our AI will automatically
            extract workout information and prepare it for import.
          </DialogDescription>
        </DialogHeader>

        {parsedWorkouts.length === 0 ? (
          <DocumentUpload
            onUpload={handleUpload}
            description="Upload your workout program document"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Found {parsedWorkouts.length} workout(s) - Review before importing:
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {parsedWorkouts.map((workout, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{workout.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>Duration: {workout.duration} minutes</div>
                        <div>Frequency: {workout.frequency.replace(/_/g, " ")}</div>
                        {(workout.ageMin || workout.ageMax) && (
                          <div>Ages: {workout.ageMin || "Any"} - {workout.ageMax || "Any"}</div>
                        )}
                        <div>Focus: {workout.focus.map(f => f.replace(/_/g, " ")).join(", ")}</div>
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
                {importing ? "Importing..." : `Import ${parsedWorkouts.length} Workout(s)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedWorkouts([])}
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
