import { buildFlowchartPrompt } from "@/lib/ai/flowchartPrompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Gemini API Key is missing");
        return NextResponse.json(
            { error: "Missing Gemini API Key" },
            { status: 500 }
        );
    }
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    const prompt = buildFlowchartPrompt(text);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const cleanedResponse = textResponse.replace(/^```json\s*|```$/g, "").trim();

    try {
        const jsonResponse = JSON.parse(cleanedResponse);
        return NextResponse.json(jsonResponse);
    } catch (parseError) {
        console.error("Failed to parse Gemini response:", textResponse);
        return NextResponse.json(
            { error: "Failed to generate valid flow data", raw: textResponse },
            { status: 500 }
        );
    }

  } catch (error) {
    console.error("Flowchart generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate flowchart" },
      { status: 500 }
    );
  }
}
