import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getAuthUser } from '@/lib/auth-helper'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Data model schemas for Gemini to understand
const DATA_MODELS = {
  schedule: {
    description: "Event/Schedule data model",
    schema: {
      title: "string (required) - Event title",
      type: "enum (required) - PRACTICE | GAME | TOURNAMENT | TEAM_MEETING | FUNDRAISER | OFF_DAY | INDIVIDUAL_LESSON",
      start: "ISO 8601 datetime string (required) - Event start date and time",
      end: "ISO 8601 datetime string (required) - Event end date and time",
      allDay: "boolean (optional, default: false) - Is this an all-day event",
      location: "string (optional) - Event location/venue",
      locationUrl: "string (optional) - Google Maps or venue URL",
      description: "string (optional) - Event description or notes",
      opponent: "string (optional) - Opponent team name (for games)",
      governingBody: "enum (optional) - NA | PBR | USSSA | JP_SPORTS | PG | GAMEDAY",
      requiresTravel: "boolean (optional, default: false) - Does this event require travel",
    }
  },
  roster: {
    description: "Player/Roster data model",
    schema: {
      firstName: "string (required) - Player's first name",
      lastName: "string (required) - Player's last name",
      jerseyNumber: "number (required) - Jersey number (integer)",
      positions: "string[] (required) - Array of positions, e.g. ['P', '1B', 'OF']",
      bats: "string (required) - L | R | S (Left, Right, Switch)",
      throws: "string (required) - L | R (Left, Right)",
      graduationYear: "number (required) - 4-digit graduation year",
      birthDate: "ISO 8601 date string (optional) - Player's birth date",
      parentName: "string (optional) - Parent/guardian name",
      parentPhone: "string (optional) - Parent phone number",
      parentEmail: "string (optional) - Parent email address",
      active: "boolean (optional, default: true) - Is player active on roster",
    }
  },
  travel: {
    description: "Tournament/Travel data model",
    schema: {
      name: "string (required) - Tournament name",
      startDate: "ISO 8601 datetime string (required) - Tournament start date",
      endDate: "ISO 8601 datetime string (required) - Tournament end date",
      location: "string (optional) - Tournament location/city",
      entryFee: "number (optional) - Entry fee amount (decimal)",
      hotelName: "string (optional) - Recommended hotel name",
      hotelLink: "string (optional) - Hotel booking link",
      hotelDeadline: "ISO 8601 datetime string (optional) - Hotel booking deadline",
      perDiem: "number (optional) - Per diem amount (decimal)",
      budget: "number (optional) - Overall tournament budget (decimal)",
      notes: "string (optional) - Tournament notes",
      itinerary: "string (optional) - Tournament itinerary/schedule",
    }
  },
  workouts: {
    description: "Workout/Training Program data model",
    schema: {
      title: "string (required) - Workout program title",
      frequency: "enum (required) - DAILY | EVERY_OTHER_DAY | TWICE_WEEKLY | WEEKLY | BIWEEKLY | MONTHLY | CUSTOM",
      ageMin: "number (optional) - Minimum age for this workout",
      ageMax: "number (optional) - Maximum age for this workout",
      duration: "number (required) - Session duration in minutes (integer)",
      programDuration: "number (optional) - How long the program runs (integer)",
      programDurationUnit: "string (optional) - DAY | WEEK | MONTH",
      focus: "string[] (required) - Array of focus areas: HITTING | PITCHING | FIELDING | BASE_RUNNING | CONDITIONING | STRENGTH | AGILITY | MENTAL | TEAM_BUILDING",
      description: "string (optional) - Workout program description",
      active: "boolean (optional, default: true) - Is this workout program active",
    }
  }
}

// Generate prompts for each data type
function getPromptForDataType(dataType: keyof typeof DATA_MODELS): string {
  const model = DATA_MODELS[dataType]

  return `You are a data extraction expert for a baseball team management system.

Your task is to extract ${model.description} from the uploaded document and return it as a JSON array.

DATA MODEL SCHEMA:
${JSON.stringify(model.schema, null, 2)}

IMPORTANT INSTRUCTIONS:
1. Extract ALL ${model.description} records you can find in the document
2. Return ONLY a valid JSON array of objects matching the schema above
3. Each object must include ALL required fields
4. Use null for optional fields if not present in the document
5. Ensure data types match exactly (strings, numbers, booleans, arrays)
6. For dates, use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
7. For enums, use EXACTLY the values specified (e.g., PRACTICE, GAME, not "practice" or "game")
8. If the document format is unclear, make reasonable assumptions based on context
9. If you cannot find any ${model.description} records, return an empty array []

EXAMPLES OF VALID OUTPUT:
${getExampleOutput(dataType)}

Now, please analyze the uploaded document and extract all ${model.description} records.

Return ONLY the JSON array, with no additional text or explanation.`
}

function getExampleOutput(dataType: keyof typeof DATA_MODELS): string {
  const examples = {
    schedule: `[
  {
    "title": "Practice - Hitting Focus",
    "type": "PRACTICE",
    "start": "2024-06-15T16:00:00.000Z",
    "end": "2024-06-15T18:00:00.000Z",
    "allDay": false,
    "location": "Smith Field",
    "description": "Focus on batting practice and situational hitting"
  },
  {
    "title": "vs Blue Jays",
    "type": "GAME",
    "start": "2024-06-20T19:00:00.000Z",
    "end": "2024-06-20T21:30:00.000Z",
    "opponent": "Blue Jays",
    "location": "Memorial Stadium",
    "requiresTravel": false
  }
]`,
    roster: `[
  {
    "firstName": "John",
    "lastName": "Smith",
    "jerseyNumber": 15,
    "positions": ["P", "1B"],
    "bats": "R",
    "throws": "R",
    "graduationYear": 2026,
    "birthDate": "2008-05-12T00:00:00.000Z",
    "parentName": "Jane Smith",
    "parentEmail": "jane.smith@email.com",
    "parentPhone": "555-1234",
    "active": true
  }
]`,
    travel: `[
  {
    "name": "Summer Showcase Tournament",
    "startDate": "2024-07-10T00:00:00.000Z",
    "endDate": "2024-07-14T00:00:00.000Z",
    "location": "Orlando, FL",
    "entryFee": 450.00,
    "hotelName": "Holiday Inn Convention Center",
    "hotelLink": "https://booking.com/hotel123",
    "hotelDeadline": "2024-06-15T00:00:00.000Z",
    "perDiem": 50.00,
    "budget": 2500.00,
    "notes": "Bring team uniforms (home and away)"
  }
]`,
    workouts: `[
  {
    "title": "Offseason Strength Program",
    "frequency": "TWICE_WEEKLY",
    "ageMin": 13,
    "ageMax": 18,
    "duration": 90,
    "programDuration": 12,
    "programDurationUnit": "WEEK",
    "focus": ["STRENGTH", "CONDITIONING", "AGILITY"],
    "description": "12-week strength and conditioning program for offseason",
    "active": true
  }
]`
  }

  return examples[dataType]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const dataType = formData.get("dataType") as keyof typeof DATA_MODELS

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!dataType || !DATA_MODELS[dataType]) {
      return NextResponse.json(
        { error: "Invalid data type. Must be one of: schedule, roster, travel, workouts" },
        { status: 400 }
      )
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer()
    const fileContent = Buffer.from(fileBuffer)

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    })

    // Get appropriate prompt for data type
    const prompt = getPromptForDataType(dataType)

    // Prepare file data for Gemini
    const filePart = {
      inlineData: {
        data: fileContent.toString("base64"),
        mimeType: file.type || "application/octet-stream",
      },
    }

    // Generate content with file and prompt
    const result = await model.generateContent([prompt, filePart])
    const response = result.response
    const text = response.text()

    // Extract JSON from response
    let parsedData
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        parsedData = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text)
      return NextResponse.json(
        {
          error: "Failed to parse document. The AI response was not in the expected format.",
          rawResponse: text
        },
        { status: 500 }
      )
    }

    // Validate that we got an array
    if (!Array.isArray(parsedData)) {
      return NextResponse.json(
        { error: "Invalid response format. Expected an array of records." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dataType,
      recordCount: parsedData.length,
      data: parsedData,
    })

  } catch (error: any) {
    console.error("Document parsing error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse document" },
      { status: 500 }
    )
  }
}
