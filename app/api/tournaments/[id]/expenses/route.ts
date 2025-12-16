import { NextResponse } from "next/server"
import { auth } from "@/auth"

import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const expenses = await db.tournamentExpense.findMany({
      where: { tournamentId: id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { category, description, amount, date } = body

    if (!category || !description || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const expense = await db.tournamentExpense.create({
      data: {
        tournamentId: id,
        category,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID required" },
        { status: 400 }
      )
    }

    await db.tournamentExpense.delete({
      where: { id: expenseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
}
