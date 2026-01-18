"use client";

import { useConversation } from "@elevenlabs/react";
import { Mic, Square } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";

interface VoiceAgentProps {
    onToolCall: (toolName: string) => Promise<string>;
    agentId?: string;
}

export function VoiceAgent({ onToolCall, agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID }: VoiceAgentProps) {
    const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

    const conversation = useConversation({
        onConnect: () => setStatus("connected"),
        onDisconnect: () => setStatus("idle"),
        onError: (err) => {
            console.error("Voice Agent Error:", err);
            setStatus("idle");
        },
        onModeChange: (mode) => {
        },
        onClientToolCall: async ({ toolName, parameters }: { toolName: string; parameters: any }) => {
            console.log("Agent requested tool:", toolName);
            try {
                const result = await onToolCall(toolName);
                return result;
            } catch (err) {
                console.error("Tool execution failed:", err);
                return "Failed to execute tool.";
            }
        },
    });

    const toggleConversation = useCallback(async () => {
        if (status === "connected") {
            await conversation.endSession();
        } else {
            if (!agentId) {
                alert("Please configure NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local");
                return;
            }
            setStatus("connecting");
            try {
                // @ts-ignore
                // @ts-ignore
                await conversation.startSession({
                    agentId: agentId,
                    clientTools: {
                        format: async (params: any) => {
                            return await onToolCall("format");
                        },
                        summarize: async (params: any) => {
                            return await onToolCall("summarize");
                        },
                        end_chat: async (params: any) => {
                            await conversation.endSession();
                            return "Goodbye";
                        }
                    }
                });
            } catch (e) {
                console.error("Failed to start conversation", e);
                setStatus("idle");
            }
        }
    }, [conversation, status, agentId]);

    return (
        <div className="flex flex-col gap-2 p-2 border rounded-lg bg-card mt-4">
            <h3 className="font-semibold text-sm">Voice Assistant</h3>
            <p className="text-xs text-muted-foreground mb-2">
                "Ask me to format or summarize this document."
            </p>
            <Button
                variant={status === "connected" ? "destructive" : "default"}
                onClick={toggleConversation}
                disabled={status === "connecting"}
                className="w-full flex gap-2 items-center justify-center"
            >
                {status === "connected" ? (
                    <>
                        <Square className="size-4" /> Stop Agent
                    </>
                ) : status === "connecting" ? (
                    "Connecting..."
                ) : (
                    <>
                        <Mic className="size-4" /> Start Agent
                    </>
                )}
            </Button>
            {status === "connected" && (
                <div className="flex items-center gap-2 justify-center mt-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-600 font-medium">Listening...</span>
                </div>
            )}
        </div>
    );
}
