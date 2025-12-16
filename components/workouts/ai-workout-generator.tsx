"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/hooks/use-toast"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIWorkoutGeneratorProps {
  onWorkoutGenerated: (workout: any) => void
  onCancel: () => void
}

export function AIWorkoutGenerator({ onWorkoutGenerated, onCancel }: AIWorkoutGeneratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help you create a workout schedule for your team. Let's start with a few questions. What age group are these workouts for? (You can provide an age range like 10-12, or just say 'various ages' if it's mixed)"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      if (!response.ok) throw new Error("Failed to generate response")

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message
      }

      setMessages(prev => [...prev, assistantMessage])

      // If workout data was generated, call the callback
      if (data.workout) {
        onWorkoutGenerated(data.workout)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center gap-2 pb-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Workout Generator</h3>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] p-3 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-muted p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
