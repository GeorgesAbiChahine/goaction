"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";

export default function Page() {
    const { user } = useUser();
    const [conversation, setConversation] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function triggerGumloop() {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const resp = await fetch("/api/gumloop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation }),
            });
            const text = await resp.text();
            if (!resp.ok) {
                setError(text);
            } else {
                setResult(text);
            }
        } catch (e: any) {
            setError(e?.message || "Request failed");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex flex-col w-full max-w-4xl h-full mx-auto gap-6">
            <div className="text-4xl font-(family-name:--font-instrument-serif)">Welcome back, <i>{user?.name}</i></div>
            <div className="flex flex-col gap-3">
                <div className="text-xl font-medium">Test Gumloop Webhook</div>
                <textarea
                    className="border rounded p-2 min-h-24"
                    placeholder="Type a conversation string..."
                    value={conversation}
                    onChange={(e) => setConversation(e.target.value)}
                />
                <button
                    className="px-3 py-2 rounded bg-black text-white disabled:opacity-50 w-fit"
                    onClick={triggerGumloop}
                    disabled={loading || conversation.trim().length === 0}
                >
                    {loading ? "Sending..." : "Send to Gumloop"}
                </button>
                {error && (
                    <div className="text-red-600 whitespace-pre-wrap">{error}</div>
                )}
                {result && (
                    <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-64">{result}</pre>
                )}
            </div>
        </div>
    )
}
