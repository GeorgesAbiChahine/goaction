import { buildFlowchartPrompt } from "@/lib/ai/flowchartPrompt";
import { buildPlatePrompt } from "@/lib/ai/platePrompt";
import { buildSummarizePrompt } from "@/lib/ai/summarizePrompt";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiKey = () => process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const getElevenLabsKey = () => process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || "";

const getGeminiModel = (modelName = "gemini-2.5-flash-lite") => {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key. Please set NEXT_PUBLIC_GEMINI_API_KEY.");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
};

export async function getScribeToken() {
    const apiKey = getElevenLabsKey();
    if (!apiKey) throw new Error("Missing ElevenLabs API Key. Please set NEXT_PUBLIC_ELEVENLABS_API_KEY.");

    try {
        const client = new ElevenLabsClient({ apiKey });
        const response = await client.tokens.singleUse.create("realtime_scribe");
        // biome-ignore lint/suspicious/noExplicitAny: ignore
        const tokenData = response as any;
        return tokenData.token || tokenData;
    } catch (e) {
        console.error("Failed to get scribe token", e);
        throw e;
    }
}

export async function extractActions(text: string) {
    if (!text) return { actions: [] };
    
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
    const jsonString = response.text().replace(/^```json\s*|```$/g, "").trim();
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse extract actions response", e);
        return { actions: [] };
    }
}

export async function generateFlowchartData(text: string) {
    if (!text) throw new Error("No text provided");
    
    const model = getGeminiModel();
    const prompt = buildFlowchartPrompt(text);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text().replace(/^```json\s*|```$/g, "").trim();
    
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed", e);
        throw new Error("Failed to generate");
    }
}

export async function summarizeText(text: string) {
    if (!text) throw new Error("No text");
    
    const model = getGeminiModel();
    const prompt = buildSummarizePrompt(text);
    
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/^```json\s*|```$/g, "").trim();
    
    return JSON.parse(raw);
}

export async function formatText(text: string) {
    if (!text) throw new Error("No text");
    
    const model = getGeminiModel();
    const prompt = buildPlatePrompt(text);
    
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/^```json\s*|```$/g, "").trim();
    
    return JSON.parse(raw);
}
