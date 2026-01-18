
import { getGeminiModel } from "@/lib/ai/gemini";
import { NextRequest, NextResponse } from "next/server";

const extractionPrompt = `
Analyze the following text and identify any actionable items such as tasks, calendar events, or emails to be sent.

Extracted actions must be returned as a JSON object with a single key "actions" containing an array of objects.

Each object must have:
- action_type: "google_task" | "google_calendar" | "gmail"
- summary: Short title or subject
- description: Details or body
- recipient: Email address (only for "gmail")
- start_time: ISO date string or natural language time (only for "google_calendar")

If no actions are found, return { "actions": [] }.

Text to analyze:
`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = getGeminiModel();
    const currentDate = new Date().toISOString();
    const dynamicPrompt = `${extractionPrompt}
Context:
The current date and time is ${currentDate}.
Important: All dates extracted must be relative to this current date. Do not assume 2024 or 2025. Today is 2026.

Text to analyze:
`;
    const result = await model.generateContent([dynamicPrompt, text]);
    const response = await result.response;
    const jsonString = response.text();

    try {
        const data = JSON.parse(jsonString);
        return NextResponse.json(data);
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        return NextResponse.json({ actions: [] });
    }

  } catch (error) {
    console.error("Action extraction failed", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
