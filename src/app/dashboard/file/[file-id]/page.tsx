"use client";

import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import { Sidebar, SidebarContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useScribe } from "@elevenlabs/react";
import {
    BlockquotePlugin,
    BoldPlugin,
    H1Plugin,
    H2Plugin,
    H3Plugin,
    ItalicPlugin,
    UnderlinePlugin
} from '@platejs/basic-nodes/react';
import { Value } from 'platejs';
import { usePlateEditor } from 'platejs/react';
import { useEffect, useRef, useState } from "react";
import Editor from "./editor";
import TranscriptInput from "./transcript-input";

const initialValue: Value = [
    {
        type: 'p',
        children: [{ text: '' }],
    },
];

export default function File() {
    const editor = usePlateEditor({
        plugins: [
            BoldPlugin,
            ItalicPlugin,
            UnderlinePlugin,
            H1Plugin.withComponent(H1Element),
            H2Plugin.withComponent(H2Element),
            H3Plugin.withComponent(H3Element),
            BlockquotePlugin.withComponent(BlockquoteElement),
        ],
        value: initialValue,
    });

    // --- SCRIBE LOGIC ---
    const [isConnecting, setIsConnecting] = useState(false);
    const [scribeError, setScribeError] = useState<string | null>(null);
    const committedCountRef = useRef(0);
    const lastCapturedPartialRef = useRef<string | null>(null);
    const recordingCounterRef = useRef(1);

    // Store transcripts locally until manually committed
    // We store the full segment objects to preserve speaker_id if available
    const [pendingSegments, setPendingSegments] = useState<any[]>([]);

    const scribe = useScribe({
        modelId: "scribe_v2_realtime",
        onError: (err) => {
            const msg = String(err);
            if (!msg.includes("1006")) {
                console.error("Scribe error:", err);
            }
        },
    });

    const handleToggleActive = async () => {
        if (scribe.isConnected) {
            // [NEW] If there's a partial transcript hanging, capture it before disconnecting
            if (scribe.partialTranscript && scribe.partialTranscript.trim().length > 0) {
                const partialSegment = {
                    text: scribe.partialTranscript,
                    words: [], // Partials usually don't have word-level timings yet
                    speaker_id: "Unknown" // We might not know speaker for partial
                };
                setPendingSegments(prev => [...prev, partialSegment]);
                lastCapturedPartialRef.current = scribe.partialTranscript;
            } else {
                lastCapturedPartialRef.current = null;
            }

            await scribe.disconnect();
            return;
        }

        setScribeError(null);
        setIsConnecting(true);

        try {
            const response = await fetch("/api/scribe-token");
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(
                    errData.details ||
                    errData.error ||
                    `Token fetch failed: ${response.statusText}`,
                );
            }
            const data = await response.json();
            if (!data.token) throw new Error("No token received");

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Microphone access is not supported.");
            }

            await scribe.connect({
                token: data.token,
                languageCode: "en",
                microphone: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
                includeTimestamps: true,
            });

            // Start with current length (even if stale) to avoid re-adding old segments.
            // When Scribe Connects/Resets, length will drop to 0, and our useEffect will catch that.
            committedCountRef.current = scribe.committedTranscripts.length;
            // Clear pending segments for a fresh session
            setPendingSegments([]);

        } catch (err: unknown) {
            console.error("Connection failed", err);
            setScribeError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsConnecting(false);
        }
    };

    // Accumulate committed transcripts instead of auto-inserting
    useEffect(() => {
        // Handle Session Reset: If the SDK clears transcripts (length drops), reset our counter.
        if (scribe.committedTranscripts.length < committedCountRef.current) {
            committedCountRef.current = scribe.committedTranscripts.length;
            return;
        }

        console.log("Scribe update:", scribe.committedTranscripts.length, "committed items");
        if (scribe.committedTranscripts.length > committedCountRef.current) {
            const newSegments = scribe.committedTranscripts.slice(committedCountRef.current);
            console.log("New segments found:", newSegments);
            setPendingSegments(prev => [...prev, ...newSegments]);
            committedCountRef.current = scribe.committedTranscripts.length;
        }
    }, [scribe.committedTranscripts]);

    const handleManualCommit = () => {
        if (pendingSegments.length === 0) return;

        const slateEditor = editor as any;

        // Combine all pending segments into one block of text
        const fullText = pendingSegments
            .map(s => s.text)
            .filter(t => t && t.trim())
            .join(' ');

        if (!fullText) return;

        const currentCount = recordingCounterRef.current;
        recordingCounterRef.current += 1;

        // Insert into editor as a single paragraph
        if (slateEditor.withoutNormalizing) {
            slateEditor.withoutNormalizing(() => {
                const node = {
                    type: 'p',
                    children: [{ text: `[Recording ${currentCount}]: ${fullText}` }],
                };

                if (slateEditor.insertNodes) {
                    slateEditor.insertNodes(node);
                }
            });
        }

        // Clear pending
        setPendingSegments([]);
    };

    // Combine all pending text for the overlay
    // Only include partialTranscript if connected AND it's not the stale one we just captured.
    const showPartial = scribe.isConnected &&
        scribe.partialTranscript &&
        scribe.partialTranscript !== lastCapturedPartialRef.current;

    const allPendingText = [
        ...pendingSegments.map(s => s.text),
        showPartial ? scribe.partialTranscript : null
    ].filter(Boolean).join(' ').trim();

    return (
        <div className="flex flex-row w-full relative h-full">
            <div className="w-full h-[calc(100%+52px)] -mt-13 relative">
                <Editor
                    editor={editor}
                    onCommit={handleManualCommit}
                    pendingCount={pendingSegments.length}
                />

                {allPendingText && (
                    <div className="absolute bottom-5 left-1/2 font-medium transform -translate-x-1/2 bg-accent text-primary px-4 py-2 rounded-lg text-base pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-2 max-w-[80%] text-center">
                        {allPendingText}
                    </div>
                )}
            </div>

            <Sidebar side="right" variant="floating">
                <SidebarContent className="p-2">
                    <SidebarGroupLabel>Voice recording</SidebarGroupLabel>
                    <TranscriptInput
                        isConnected={scribe.isConnected}
                        isConnecting={isConnecting}
                        onToggle={handleToggleActive}
                        error={scribeError}
                    />

                </SidebarContent>
            </Sidebar>
        </div>
    )
}