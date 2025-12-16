import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    const fullPath = path.join(process.cwd(), "uploads", ...filePath)

    // Read the file
    const fileBuffer = await readFile(fullPath)

    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase()
    const contentTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    }

    const contentType = contentTypes[ext] || "application/octet-stream"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    )
  }
}
