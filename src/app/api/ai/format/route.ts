import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/ai/gemini";
import { buildPlatePrompt } from "@/lib/ai/platePrompt";

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
    const prompt = buildPlatePrompt(text);

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to format text" },
      { status: 500 }
    );
  }
}
