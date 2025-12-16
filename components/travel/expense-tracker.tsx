"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Receipt, Plus, Trash2, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDate } from "@/lib/utils"

interface TournamentExpense {
  id: string
  category: string
  description: string
  amount: number
  date: Date | string
}

interface ExpenseTrackerProps {
  tournamentId: string
  expenses: TournamentExpense[]
  budget?: number | null
}

const EXPENSE_CATEGORIES = [
  "Entry Fee",
  "Hotel",
  "Transportation",
  "Food",
  "Equipment",
  "Umpire Fees",
  "Field Rental",
  "Other",
]

export function ExpenseTracker({ tournamentId, expenses, budget }: ExpenseTrackerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add expense')
      }

      toast({
        title: "Expense added",
        description: `${formData.description} has been recorded.`,
      })

      setFormData({
        category: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (expenseId: string) => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/expenses?expenseId=${expenseId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      toast({
        title: "Expense removed",
        description: "The expense has been removed successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = budget ? budget - totalExpenses : null
  const overBudget = remaining !== null && remaining < 0

  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0
    }
    acc[expense.category] += expense.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expense Tracker
            </CardTitle>
            <CardDescription>
              Track all tournament-related expenses
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancel" : "Add Expense"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Total Expenses
            </div>
            <div className="text-2xl font-bold">
              ${totalExpenses.toFixed(2)}
            </div>
          </div>

          {budget && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Budget
                </div>
                <div className="text-2xl font-bold">
                  ${budget.toFixed(2)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${overBudget ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  {overBudget ? "Over Budget" : "Remaining"}
                </div>
                <div className={`text-2xl font-bold ${overBudget ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(remaining || 0).toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the expense"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
            </div>
          </form>
        )}

        {expenses.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No expenses recorded yet</p>
            <p className="text-sm">Click "Add Expense" to get started</p>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="space-y-4">
            {Object.entries(expensesByCategory).length > 1 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Expenses by Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{category}:</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">All Expenses</h4>
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{expense.description}</h5>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove expense?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove this expense record. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(expense.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
