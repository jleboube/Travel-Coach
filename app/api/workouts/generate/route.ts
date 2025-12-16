import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const systemPrompt = `You are a helpful baseball workout coach assistant. Your job is to help create workout schedules for youth baseball teams.

When creating a workout, you need to gather the following information through conversation:
1. Age range of the players (optional but helpful)
2. Focus areas (hitting, pitching, fielding, base running, conditioning, strength, agility, mental training, team building)
3. How long each workout session should be (in minutes)
4. How often workouts should happen (daily, every other day, twice weekly, weekly, biweekly, monthly)
5. How long the workout program should run for (duration: number of days, weeks, or months)
6. Any specific goals or requirements

Once you have all the information, generate a workout plan in JSON format like this:
{
  "title": "Hitting Practice for 12U",
  "ageMin": 10,
  "ageMax": 12,
  "duration": 60,
  "frequency": "TWICE_WEEKLY",
  "programDuration": 8,
  "programDurationUnit": "WEEK",
  "focus": ["HITTING", "CONDITIONING"],
  "description": "Detailed workout description with drills and exercises..."
}

Valid frequency values: DAILY, EVERY_OTHER_DAY, TWICE_WEEKLY, WEEKLY, BIWEEKLY, MONTHLY
Valid focus values: HITTING, PITCHING, FIELDING, BASE_RUNNING, CONDITIONING, STRENGTH, AGILITY, MENTAL, TEAM_BUILDING
Valid programDurationUnit values: DAY, WEEK, MONTH

Be conversational and friendly. Ask questions one at a time. When you have all the information, say "I have all the information I need. Let me generate your workout plan!" and then output the JSON.`

    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response.text()

    // Check if the response contains JSON workout data
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    let workoutData = null

    if (jsonMatch) {
      try {
        workoutData = JSON.parse(jsonMatch[0])
      } catch (e) {
        // JSON parsing failed, continue without workout data
      }
    }

    return NextResponse.json({
      message: response,
      workout: workoutData,
    })
  } catch (error) {
    console.error("Error generating workout:", error)
    return NextResponse.json(
      { error: "Failed to generate workout", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
