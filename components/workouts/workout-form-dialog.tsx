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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Sparkles } from "lucide-react"
import { AIWorkoutGenerator } from "./ai-workout-generator"

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "EVERY_OTHER_DAY", label: "Every Other Day" },
  { value: "TWICE_WEEKLY", label: "Twice Weekly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CUSTOM", label: "Custom" },
]

const FOCUS_AREAS = [
  { value: "HITTING", label: "Hitting" },
  { value: "PITCHING", label: "Pitching" },
  { value: "FIELDING", label: "Fielding" },
  { value: "BASE_RUNNING", label: "Base Running" },
  { value: "CONDITIONING", label: "Conditioning" },
  { value: "STRENGTH", label: "Strength Training" },
  { value: "AGILITY", label: "Agility & Speed" },
  { value: "MENTAL", label: "Mental Training" },
  { value: "TEAM_BUILDING", label: "Team Building" },
]

const PROGRAM_DURATION_UNITS = [
  { value: "DAY", label: "Day(s)" },
  { value: "WEEK", label: "Week(s)" },
  { value: "MONTH", label: "Month(s)" },
]

interface WorkoutFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout?: any
  onSave: (data: any) => void
}

export function WorkoutFormDialog({
  open,
  onOpenChange,
  workout,
  onSave,
}: WorkoutFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    frequency: "WEEKLY",
    ageMin: "",
    ageMax: "",
    duration: "60",
    programDuration: "",
    programDurationUnit: "WEEK",
    focus: [] as string[],
    description: "",
    active: true,
  })

  useEffect(() => {
    if (workout) {
      setUseAI(false)
      setFormData({
        title: workout.title || "",
        frequency: workout.frequency || "WEEKLY",
        ageMin: workout.ageMin?.toString() || "",
        ageMax: workout.ageMax?.toString() || "",
        duration: workout.duration?.toString() || "60",
        programDuration: workout.programDuration?.toString() || "",
        programDurationUnit: workout.programDurationUnit || "WEEK",
        focus: workout.focus || [],
        description: workout.description || "",
        active: workout.active !== undefined ? workout.active : true,
      })
    } else {
      setUseAI(false)
      setFormData({
        title: "",
        frequency: "WEEKLY",
        ageMin: "",
        ageMax: "",
        duration: "60",
        programDuration: "",
        programDurationUnit: "WEEK",
        focus: [],
        description: "",
        active: true,
      })
    }
  }, [workout, open])

  function handleAIWorkoutGenerated(aiWorkout: any) {
    setFormData({
      title: aiWorkout.title || "",
      frequency: aiWorkout.frequency || "WEEKLY",
      ageMin: aiWorkout.ageMin?.toString() || "",
      ageMax: aiWorkout.ageMax?.toString() || "",
      duration: aiWorkout.duration?.toString() || "60",
      programDuration: aiWorkout.programDuration?.toString() || "",
      programDurationUnit: aiWorkout.programDurationUnit || "WEEK",
      focus: aiWorkout.focus || [],
      description: aiWorkout.description || "",
      active: true,
    })
    setUseAI(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const data = {
      title: formData.title,
      frequency: formData.frequency,
      ageMin: formData.ageMin ? parseInt(formData.ageMin) : null,
      ageMax: formData.ageMax ? parseInt(formData.ageMax) : null,
      duration: parseInt(formData.duration),
      programDuration: formData.programDuration ? parseInt(formData.programDuration) : null,
      programDurationUnit: formData.programDuration ? formData.programDurationUnit : null,
      focus: formData.focus,
      description: formData.description || null,
      active: formData.active,
    }

    onSave(data)
    setLoading(false)
  }

  function handleFocusToggle(value: string) {
    setFormData((prev) => ({
      ...prev,
      focus: prev.focus.includes(value)
        ? prev.focus.filter((f) => f !== value)
        : [...prev.focus, value],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workout ? "Edit Workout" : "Create Workout"}
          </DialogTitle>
          <DialogDescription>
            {workout
              ? "Update the workout schedule details below."
              : !useAI
              ? "Create a new workout schedule for your team, or use AI to help you."
              : "Let our AI assistant help you create the perfect workout."}
          </DialogDescription>
        </DialogHeader>

        {useAI && !workout ? (
          <AIWorkoutGenerator
            onWorkoutGenerated={handleAIWorkoutGenerated}
            onCancel={() => setUseAI(false)}
          />
        ) : (
          <>
            {!workout && (
              <div className="pb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUseAI(true)}
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI Assistant
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Workout Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Hitting Practice for 12U"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageMin">Minimum Age</Label>
                <Input
                  id="ageMin"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ageMin}
                  onChange={(e) =>
                    setFormData({ ...formData, ageMin: e.target.value })
                  }
                  placeholder="e.g., 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageMax">Maximum Age</Label>
                <Input
                  id="ageMax"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ageMax}
                  onChange={(e) =>
                    setFormData({ ...formData, ageMax: e.target.value })
                  }
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Program Duration (How long should this workout run for?)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min="1"
                  value={formData.programDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, programDuration: e.target.value })
                  }
                  placeholder="e.g., 8"
                />
                <Select
                  value={formData.programDurationUnit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, programDurationUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_DURATION_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Workout Focus * (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {FOCUS_AREAS.map((focus) => (
                  <div key={focus.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={focus.value}
                      checked={formData.focus.includes(focus.value)}
                      onCheckedChange={() => handleFocusToggle(focus.value)}
                    />
                    <label
                      htmlFor={focus.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {focus.label}
                    </label>
                  </div>
                ))}
              </div>
              {formData.focus.length === 0 && (
                <p className="text-xs text-red-500">
                  Please select at least one focus area
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the workout details, drills, or goals..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked as boolean })
                }
              />
              <label
                htmlFor="active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Active (workout is currently in use)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.focus.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {workout ? "Update" : "Create"} Workout
            </Button>
          </DialogFooter>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
