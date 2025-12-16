"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Mail, X, Copy, Check } from "lucide-react"
import { InviteDialog } from "./invite-dialog"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/components/ui/hooks/use-toast"

type Member = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

type Invitation = {
  id: string
  email: string
  role: string
  token: string
  expiresAt: Date
  createdAt: Date
  inviter: {
    name: string | null
    email: string
  }
}

export function TeamManagement({
  initialMembers,
  initialInvitations,
}: {
  initialMembers: Member[]
  initialInvitations: Invitation[]
}) {
  const [members, setMembers] = useState(initialMembers)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const { toast } = useToast()

  function getRoleColor(role: string) {
    const colors = {
      HEAD_COACH: "bg-purple-100 text-purple-800",
      ASSISTANT_COACH: "bg-blue-100 text-blue-800",
      TEAM_MANAGER: "bg-green-100 text-green-800",
      PARENT: "bg-gray-100 text-gray-800",
    }
    return colors[role as keyof typeof colors] || colors.PARENT
  }

  function getRoleLabel(role: string) {
    return role.replace(/_/g, " ")
  }

  async function handleInviteSent(invitation: Invitation & { invitationLink: string }) {
    setInvitations([invitation, ...invitations])
    setDialogOpen(false)

    // Copy invitation link to clipboard
    await navigator.clipboard.writeText(invitation.invitationLink)

    toast({
      title: "Invitation sent!",
      description: "Invitation link has been copied to your clipboard.",
    })
  }

  async function handleCancelInvitation(id: string) {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to cancel invitation")

      setInvitations(invitations.filter((inv) => inv.id !== id))
      toast({
        title: "Success",
        description: "Invitation cancelled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      })
    }
  }

  async function copyInvitationLink(token: string) {
    const link = `${window.location.origin}/register?token=${token}`
    await navigator.clipboard.writeText(link)
    setCopiedToken(token)

    setTimeout(() => setCopiedToken(null), 2000)

    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({members.length})
              </CardTitle>
              <CardDescription>Current coaching staff and team members</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name || "No name"}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(member.role)}>
                    {getRoleLabel(member.role)}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    Joined {formatDateTime(member.createdAt).split(" at ")[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invited by {invitation.inviter.name || invitation.inviter.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleColor(invitation.role)}>
                      {getRoleLabel(invitation.role)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation.token)}
                    >
                      {copiedToken === invitation.token ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <InviteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInviteSent={handleInviteSent}
      />
    </div>
  )
}
