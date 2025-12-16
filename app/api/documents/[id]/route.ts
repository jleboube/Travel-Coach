import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { unlink } from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      const filepath = path.join(process.cwd(), document.fileUrl)
      await unlink(filepath)
    } catch (error) {
      console.error("Error deleting file:", error)
      // Continue even if file deletion fails
    }

    // Delete database record
    await db.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
