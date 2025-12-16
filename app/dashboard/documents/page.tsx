"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DocumentCard } from "@/components/documents/document-card"
import { UploadDialog } from "@/components/documents/upload-dialog"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Plus, Loader2, Grid3x3, List } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ViewMode = "grid" | "list"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const response = await fetch("/api/documents")
      if (!response.ok) throw new Error("Failed to fetch documents")
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(
    file: File,
    metadata: {
      name: string
      type: string
      description: string
      playerId?: string
    }
  ) {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", metadata.name)
      formData.append("type", metadata.type)
      formData.append("description", metadata.description || "")
      if (metadata.playerId) {
        formData.append("playerId", metadata.playerId)
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload document")

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      setUploadDialogOpen(false)
      fetchDocuments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteDocument() {
    if (!documentToDelete) return

    try {
      const response = await fetch(`/api/documents/${documentToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete document")

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
      fetchDocuments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  function openDeleteDialog(documentId: string) {
    setDocumentToDelete(documentId)
    setDeleteDialogOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage team documents, forms, and files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <Grid3x3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Your First Document
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={() => openDeleteDialog(document.id)}
            />
          ))}
        </div>
      )}

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
