import { getGeminiModel } from "@/lib/ai/gemini";
import { buildSummarizePrompt } from "@/lib/ai/summarizePrompt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing text" },
        { status: 400 }
      );
    }

    const model = getGeminiModel();
    const prompt = buildSummarizePrompt(text);

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to summarize text" },
      { status: 500 }
    );
  }
}
