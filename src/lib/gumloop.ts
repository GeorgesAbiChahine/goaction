export async function startGumloop(payload: any) {
  if (!payload) {
    throw new Error("payload must be provided");
  }

  const webhook = process.env.GUMLOOP_WEBHOOK;
  const apiKey = process.env.GUMLOOP_API_KEY;

  if (!webhook) {
    console.error("Missing GUMLOOP_WEBHOOK env var");
    throw new Error("Missing GUMLOOP_WEBHOOK env var");
  }
  
  // Note: apiKey might not be strictly required by webhook depending on config, but good to have
  if (!apiKey) {
     console.warn("Missing GUMLOOP_API_KEY env var");
  }

  console.log("Sending payload to Gumloop:", JSON.stringify(payload, null, 2));

  const resp = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
      const errText = await resp.text();
      console.error(`Gumloop API error: ${resp.status} ${resp.statusText}`, errText);
      // We should probably throw here to let the caller handle it or return a response that indicates failure
  }

  return resp;
}
