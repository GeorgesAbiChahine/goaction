import { startGumloop } from "@/lib/gumloop";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return new Response(
        JSON.stringify({ error: "Missing body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resp = await startGumloop(body);
    
    if (!resp.ok) {
        console.error("Gumloop backend failed:", resp.status, await resp.text().catch(() => "No body"));
    }

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
