export async function startGumloop(conversation: string) {
  if (!conversation || typeof conversation !== "string") {
    throw new Error("conversation must be a non-empty string");
  }

  const webhook = process.env.GUMLOOP_WEBHOOK;
  const apiKey = process.env.GUMLOOP_API_KEY;

  if (!webhook) {
    throw new Error("Missing GUMLOOP_WEBHOOK env var");
  }
  if (!apiKey) {
    throw new Error("Missing GUMLOOP_API_KEY env var");
  }

  const resp = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ conversation }),
  });

  return resp;
}
