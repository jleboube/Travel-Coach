"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Loader2 } from "lucide-react"

type Invitation = {
  id: string
  email: string
  role: string
  token: string
}

export function RegisterForm({ invitation }: { invitation: Invitation }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })

  function getRoleLabel(role: string) {
    return role.replace(/_/g, " ")
  }

  function getRoleColor(role: string) {
    const colors = {
      HEAD_COACH: "bg-purple-100 text-purple-800",
      ASSISTANT_COACH: "bg-blue-100 text-blue-800",
      TEAM_MANAGER: "bg-green-100 text-green-800",
      PARENT: "bg-gray-100 text-gray-800",
    }
    return colors[role as keyof typeof colors] || colors.PARENT
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invitation.token,
          name: formData.name,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create account")
      }

      toast({
        title: "Success!",
        description: "Your account has been created. Redirecting to login...",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          You've been invited to join the coaching staff
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={invitation.email}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge className={getRoleColor(invitation.role)}>
                {getRoleLabel(invitation.role)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">Must be at least 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
