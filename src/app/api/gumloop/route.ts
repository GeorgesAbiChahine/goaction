import { NextRequest } from "next/server";
import { startGumloop } from "@/lib/gumloop";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const conversation = body?.conversation;

    if (!conversation || typeof conversation !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'conversation'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resp = await startGumloop(conversation);

    const contentType = resp.headers.get("content-type") || "application/json";
    const text = await resp.text();

    return new Response(text, { status: resp.status, headers: { "Content-Type": contentType } });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unhandled error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
