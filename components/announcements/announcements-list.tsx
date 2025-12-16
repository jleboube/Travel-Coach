"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Megaphone, AlertCircle } from "lucide-react"
import { AnnouncementDialog } from "./announcement-dialog"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/components/ui/hooks/use-toast"

type Announcement = {
  id: string
  title: string
  content: string
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
  createdAt: Date
  author: {
    name: string | null
    email: string
  }
}

export function AnnouncementsList({
  initialAnnouncements,
  userRole,
}: {
  initialAnnouncements: Announcement[]
  userRole: string
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const canPost = ["HEAD_COACH", "ASSISTANT_COACH", "TEAM_MANAGER"].includes(userRole)

  function getPriorityColor(priority: string) {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      NORMAL: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || colors.NORMAL
  }

  function getPriorityIcon(priority: string) {
    if (priority === "URGENT" || priority === "HIGH") {
      return <AlertCircle className="h-4 w-4" />
    }
    return <Megaphone className="h-4 w-4" />
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete announcement")

      setAnnouncements(announcements.filter((a) => a.id !== id))
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {canPost && (
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      )}

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No announcements yet. Check back later for team updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <CardDescription>
                        Posted by {announcement.author.name || announcement.author.email} •{" "}
                        {formatDateTime(announcement.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                </div>
                {canPost && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(newAnnouncement) => {
          setAnnouncements([newAnnouncement, ...announcements])
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
