"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import {
  FileText,
  Download,
  Trash2,
  Shield,
  Calendar,
  HardDrive,
  FileIcon,
} from "lucide-react"

interface DocumentCardProps {
  document: {
    id: string
    name: string
    type: string
    fileUrl: string
    fileSize: number
    mimeType: string
    encrypted: boolean
    createdAt: string | Date
    description?: string | null
  }
  onDelete?: () => void
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getDocumentIcon = () => {
    if (document.mimeType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (document.mimeType.includes("image")) {
      return <FileIcon className="h-8 w-8 text-blue-500" />
    }
    if (
      document.mimeType.includes("word") ||
      document.mimeType.includes("document")
    ) {
      return <FileText className="h-8 w-8 text-blue-600" />
    }
    if (
      document.mimeType.includes("sheet") ||
      document.mimeType.includes("excel")
    ) {
      return <FileText className="h-8 w-8 text-green-600" />
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />
  }

  const getTypeBadge = () => {
    const typeColors: Record<string, string> = {
      INSURANCE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      BIRTH_CERTIFICATE: "bg-green-500/10 text-green-500 border-green-500/20",
      MEDICAL_FORM: "bg-red-500/10 text-red-500 border-red-500/20",
      ROSTER: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }

    const typeLabels: Record<string, string> = {
      INSURANCE: "Insurance",
      BIRTH_CERTIFICATE: "Birth Certificate",
      MEDICAL_FORM: "Medical Form",
      ROSTER: "Roster",
      OTHER: "Other",
    }

    return (
      <Badge
        variant="outline"
        className={typeColors[document.type] || typeColors.OTHER}
      >
        {typeLabels[document.type] || "Other"}
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getDocumentIcon()}</div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{document.name}</h3>
                {document.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {document.description}
                  </p>
                )}
              </div>
              {getTypeBadge()}
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatFileSize(document.fileSize)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(document.createdAt)}
              </div>
              {document.encrypted && (
                <div className="flex items-center gap-1 text-green-600">
                  <Shield className="h-3 w-3" />
                  Encrypted
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <a
                  href={document.fileUrl}
                  download={document.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
