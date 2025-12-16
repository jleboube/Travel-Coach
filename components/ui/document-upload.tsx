"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/hooks/use-toast"

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
  description?: string
}

export function DocumentUpload({
  onUpload,
  accept = ".xlsx,.xls,.csv,.txt,.doc,.docx",
  maxSize = 10,
  description = "Upload a spreadsheet or document file"
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      await onUpload(file)
      setFile(null)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />

          {!file ? (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {description}
                </p>
                <p className="text-xs text-gray-500">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: Excel, CSV, Text, Word (max {maxSize}MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => inputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upload & Parse Document"
                  )}
                </Button>
                {!uploading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
