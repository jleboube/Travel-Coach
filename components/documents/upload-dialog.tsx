"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
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
import { Upload, FileIcon, X } from "lucide-react"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File, metadata: DocumentMetadata) => void
}

interface DocumentMetadata {
  name: string
  type: string
  description: string
  playerId?: string
}

const DOCUMENT_TYPES = [
  { value: "INSURANCE", label: "Insurance" },
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
  { value: "MEDICAL_FORM", label: "Medical Form" },
  { value: "ROSTER", label: "Roster" },
  { value: "OTHER", label: "Other" },
]

export function UploadDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    name: "",
    type: "OTHER",
    description: "",
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      setMetadata((prev) => ({
        ...prev,
        name: prev.name || selectedFile.name,
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    onUpload(file, metadata)

    // Reset form
    setFile(null)
    setMetadata({
      name: "",
      type: "OTHER",
      description: "",
    })
  }

  function removeFile() {
    setFile(null)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document for your team records
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Drag and Drop Area */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm text-primary">Drop the file here...</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag and drop a file here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Selected File */}
            {file && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={metadata.name}
                onChange={(e) =>
                  setMetadata({ ...metadata, name: e.target.value })
                }
                placeholder="Enter document name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select
                value={metadata.type}
                onValueChange={(value) =>
                  setMetadata({ ...metadata, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) =>
                  setMetadata({ ...metadata, description: e.target.value })
                }
                placeholder="Add a description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
