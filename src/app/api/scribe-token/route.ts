import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set in environment.");
    return NextResponse.json(
      { error: "Server misconfiguration: ELEVENLABS_API_KEY is missing" },
      { status: 500 },
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const response = await client.tokens.singleUse.create("realtime_scribe");

    const tokenData = response as any;
    const token = tokenData.token || tokenData;

    if (typeof token !== "string") {
      throw new Error("Unexpected token format from SDK");
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to fetch token from ElevenLabs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
