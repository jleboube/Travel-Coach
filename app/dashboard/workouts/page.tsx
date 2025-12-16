"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Plus, Loader2, Dumbbell, Clock, Users, Target } from "lucide-react"
import { WorkoutFormDialog } from "@/components/workouts/workout-form-dialog"
import { WorkoutUpload } from "@/components/workouts/workout-upload"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    try {
      const response = await fetch("/api/workouts")
      if (!response.ok) throw new Error("Failed to fetch workouts")
      const data = await response.json()
      setWorkouts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveWorkout(formData: any) {
    try {
      const url = editingWorkout
        ? `/api/workouts/${editingWorkout.id}`
        : "/api/workouts"
      const method = editingWorkout ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save workout")

      toast({
        title: "Success",
        description: editingWorkout
          ? "Workout updated successfully"
          : "Workout created successfully",
      })

      setDialogOpen(false)
      setEditingWorkout(null)
      fetchWorkouts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive",
      })
    }
  }

  function openNewWorkoutDialog() {
    setEditingWorkout(null)
    setDialogOpen(true)
  }

  function openEditDialog(workout: any) {
    setEditingWorkout(workout)
    setDialogOpen(true)
  }

  function getFrequencyLabel(frequency: string) {
    const labels: Record<string, string> = {
      DAILY: "Daily",
      EVERY_OTHER_DAY: "Every Other Day",
      TWICE_WEEKLY: "Twice Weekly",
      WEEKLY: "Weekly",
      BIWEEKLY: "Biweekly",
      MONTHLY: "Monthly",
      CUSTOM: "Custom",
    }
    return labels[frequency] || frequency
  }

  function getFocusBadgeColor(focus: string) {
    const colors: Record<string, string> = {
      HITTING: "bg-blue-100 text-blue-800",
      PITCHING: "bg-green-100 text-green-800",
      FIELDING: "bg-yellow-100 text-yellow-800",
      BASE_RUNNING: "bg-purple-100 text-purple-800",
      CONDITIONING: "bg-red-100 text-red-800",
      STRENGTH: "bg-orange-100 text-orange-800",
      AGILITY: "bg-pink-100 text-pink-800",
      MENTAL: "bg-indigo-100 text-indigo-800",
      TEAM_BUILDING: "bg-teal-100 text-teal-800",
    }
    return colors[focus] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">
            Create and manage workout schedules for your team
          </p>
        </div>
        <div className="flex gap-2">
          <WorkoutUpload onImportComplete={fetchWorkouts} />
          <Button onClick={openNewWorkoutDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first workout schedule
          </p>
          <Button onClick={openNewWorkoutDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Workout
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openEditDialog(workout)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{workout.title}</CardTitle>
                  {workout.active && (
                    <Badge variant="default" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{workout.duration} minutes</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{getFrequencyLabel(workout.frequency)}</span>
                </div>

                {(workout.ageMin || workout.ageMax) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Ages {workout.ageMin || "Any"} - {workout.ageMax || "Any"}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {workout.focus.map((focus: string) => (
                      <Badge
                        key={focus}
                        variant="outline"
                        className={getFocusBadgeColor(focus)}
                      >
                        {focus.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                {workout.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {workout.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {workout._count.sessions} session{workout._count.sessions !== 1 ? "s" : ""} scheduled
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WorkoutFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workout={editingWorkout}
        onSave={handleSaveWorkout}
      />
    </div>
  )
}
