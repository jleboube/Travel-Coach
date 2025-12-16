"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface TeamConfig {
  id: string
  teamName: string
  season: string
  logoUrl: string | null
  colors: string[]
  ageGroup: string | null
}

interface SettingsFormProps {
  user: User | null
  teamConfig: TeamConfig | null
  isHeadCoach: boolean
}

export function SettingsForm({ user, teamConfig, isHeadCoach }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState(user?.name || "")
  const [teamName, setTeamName] = useState(teamConfig?.teamName || "")
  const [season, setSeason] = useState(teamConfig?.season || new Date().getFullYear().toString())
  const [ageGroup, setAgeGroup] = useState(teamConfig?.ageGroup || "")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          season,
          ageGroup,
        }),
      })

      if (!response.ok) throw new Error("Failed to update team settings")

      toast({
        title: "Team settings updated",
        description: "Team configuration has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {isHeadCoach && <TabsTrigger value="team">Team Settings</TabsTrigger>}
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role.replace(/_/g, " ") || ""}
                disabled
                className="bg-gray-100"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      {isHeadCoach && (
        <TabsContent value="team" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Team Configuration</h2>
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Input
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  placeholder="e.g., 12U, 14U, 16U"
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Team Settings"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="account" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Change Password</h3>
              <p className="text-sm text-gray-500 mb-4">
                Update your password to keep your account secure
              </p>
              <Button variant="outline" disabled>
                Change Password (Coming Soon)
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-4">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
