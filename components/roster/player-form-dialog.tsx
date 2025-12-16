'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/hooks/use-toast'
import axios from 'axios'
import { Plus } from 'lucide-react'

interface PlayerFormDialogProps {
  player?: {
    id: string
    firstName: string
    lastName: string
    jerseyNumber: number
    photo?: string | null
    positions: string[]
    bats: string
    throws: string
    graduationYear: number
    birthDate?: Date | null
    parentName?: string | null
    parentPhone?: string | null
    parentEmail?: string | null
    active: boolean
  }
  trigger?: React.ReactNode
}

const POSITION_OPTIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'INF', 'UTIL']

export function PlayerFormDialog({ player, trigger }: PlayerFormDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    jerseyNumber: player?.jerseyNumber || 0,
    photo: player?.photo || '',
    positions: player?.positions || [],
    bats: player?.bats || 'R',
    throws: player?.throws || 'R',
    graduationYear: player?.graduationYear || new Date().getFullYear() + 4,
    birthDate: player?.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : '',
    parentName: player?.parentName || '',
    parentPhone: player?.parentPhone || '',
    parentEmail: player?.parentEmail || '',
    active: player?.active ?? true,
  })

  const handlePositionToggle = (position: string) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        jerseyNumber: Number(formData.jerseyNumber),
        graduationYear: Number(formData.graduationYear),
        birthDate: formData.birthDate || null,
        parentEmail: formData.parentEmail || null,
      }

      if (player) {
        // Update existing player
        await axios.patch(`/api/players/${player.id}`, submitData)
        toast({
          title: 'Player updated',
          description: `${formData.firstName} ${formData.lastName} has been updated successfully.`,
        })
      } else {
        // Create new player
        await axios.post('/api/players', submitData)
        toast({
          title: 'Player added',
          description: `${formData.firstName} ${formData.lastName} has been added to the roster.`,
        })
      }

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error saving player:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save player. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{player ? 'Edit Player' : 'Add New Player'}</DialogTitle>
          <DialogDescription>
            {player ? 'Update player information and stats.' : 'Add a new player to your roster.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jerseyNumber">Jersey Number *</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  min="0"
                  max="99"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  min="2020"
                  max="2040"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              />
            </div>
          </div>

          {/* Positions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Positions *</h3>
            <div className="grid grid-cols-4 gap-3">
              {POSITION_OPTIONS.map((position) => (
                <div key={position} className="flex items-center space-x-2">
                  <Checkbox
                    id={`position-${position}`}
                    checked={formData.positions.includes(position)}
                    onCheckedChange={() => handlePositionToggle(position)}
                  />
                  <Label
                    htmlFor={`position-${position}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {position}
                  </Label>
                </div>
              ))}
            </div>
            {formData.positions.length === 0 && (
              <p className="text-sm text-red-500">Please select at least one position</p>
            )}
          </div>

          {/* Bats/Throws */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Batting & Throwing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bats">Bats *</Label>
                <select
                  id="bats"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.bats}
                  onChange={(e) => setFormData({ ...formData, bats: e.target.value })}
                  required
                >
                  <option value="R">Right (R)</option>
                  <option value="L">Left (L)</option>
                  <option value="S">Switch (S)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="throws">Throws *</Label>
                <select
                  id="throws"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.throws}
                  onChange={(e) => setFormData({ ...formData, throws: e.target.value })}
                  required
                >
                  <option value="R">Right (R)</option>
                  <option value="L">Left (L)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Parent/Guardian Contact</h3>
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          {player && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
              />
              <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                Active player on roster
              </Label>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.positions.length === 0}>
              {loading ? 'Saving...' : player ? 'Update Player' : 'Add Player'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
