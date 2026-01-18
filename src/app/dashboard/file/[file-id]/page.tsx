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
import { Loader, ToolboxIcon } from 'lucide-react';
import { useParams } from "next/navigation";
import { Value } from 'platejs';
import { usePlateEditor } from 'platejs/react';
import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "./editor";
import TranscriptInput from "./transcript-input";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Button } from '@/components/ui/button';
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select"

const initialEmptyValue: Value = [
    {
        type: 'p',
        children: [{ text: '' }],
    },
];

function FileEditorInner({ initialContent, fileId }: { initialContent: Value, fileId: string }) {
    const saveToFile = (newValue: Value) => {
        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                const updatedFiles = files.map((f: any) =>
                    f.id === fileId ? { ...f, content: newValue } : f
                );
                localStorage.setItem('files', JSON.stringify(updatedFiles));
            }
        } catch (e) {
            console.error("Auto-save failed", e);
        }
    };

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
        value: initialContent,
    });

    const [isConnecting, setIsConnecting] = useState(false);
    const [scribeError, setScribeError] = useState<string | null>(null);
    const committedCountRef = useRef(0);
    const lastCapturedPartialRef = useRef<string | null>(null);

    const initialCounter = useMemo(() => {
        let max = 0;
        const regex = /\[Recording (\d+)\]:/;

        const scanNodes = (nodes: any[]) => {
            for (const node of nodes) {
                if (node.text) {
                    const match = node.text.match(regex);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (!isNaN(num) && num > max) max = num;
                    }
                }
                if (node.children) {
                    scanNodes(node.children);
                }
            }
        };

        scanNodes(initialContent);
        return max + 1;
    }, [initialContent]);

    const recordingCounterRef = useRef(initialCounter);

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
            if (scribe.partialTranscript && scribe.partialTranscript.trim().length > 0) {
                const partialSegment = {
                    text: scribe.partialTranscript,
                    words: [],
                    speaker_id: "Unknown"
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
                throw new Error(errData.details || errData.error || `Token fetch failed`);
            }
            const data = await response.json();
            if (!data.token) throw new Error("No token received");

            if (!navigator.mediaDevices || navigator.mediaDevices.getUserMedia === undefined) {
                throw new Error("Microphone access is not supported.");
            }

            await scribe.connect({
                token: data.token,
                languageCode: "en",
                microphone: { echoCancellation: true, noiseSuppression: true },
                includeTimestamps: true,
            });

            committedCountRef.current = scribe.committedTranscripts.length;
            setPendingSegments([]);

        } catch (err: unknown) {
            console.error("Connection failed", err);
            setScribeError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        if (scribe.committedTranscripts.length < committedCountRef.current) {
            committedCountRef.current = scribe.committedTranscripts.length;
            return;
        }
        if (scribe.committedTranscripts.length > committedCountRef.current) {
            const newSegments = scribe.committedTranscripts.slice(committedCountRef.current);
            setPendingSegments(prev => [...prev, ...newSegments]);
            committedCountRef.current = scribe.committedTranscripts.length;
        }
    }, [scribe.committedTranscripts]);

    const handleManualCommit = () => {
        if (pendingSegments.length === 0) return;

        const slateEditor = editor as any;
        const fullText = pendingSegments.map(s => s.text).filter(Boolean).join(' ');

        if (!fullText.trim()) return;

        const currentCount = recordingCounterRef.current;
        recordingCounterRef.current += 1;

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
        setPendingSegments([]);
    };

    const showPartial = scribe.isConnected && scribe.partialTranscript && scribe.partialTranscript !== lastCapturedPartialRef.current;

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
                    onChange={({ value }: { value: Value }) => saveToFile(value)}
                />

                {allPendingText && (
                    <div className="absolute bottom-5 left-1/2 font-medium transform -translate-x-1/2 bg-accent text-primary px-4 py-2 rounded-lg text-base pointer-events-none z-50 animate-in fade-in slide-in-from-bottom-2 max-w-full text-center">
                        {allPendingText}
                    </div>
                )}
            </div>

            <Sidebar side="right" variant="floating">
                <SidebarContent className="p-2">
                    <SidebarGroupLabel>Record vocals</SidebarGroupLabel>
                    <TranscriptInput
                        isConnected={scribe.isConnected}
                        isConnecting={isConnecting}
                        onToggle={handleToggleActive}
                        error={scribeError}
                    />
                    <SidebarGroupLabel className="mt-5">Tools</SidebarGroupLabel>
                    <Empty className="bg-muted border p-2">
                        <EmptyHeader>
                            <EmptyMedia variant="icon" className="bg-background border">
                                <ToolboxIcon />
                            </EmptyMedia>
                            <EmptyTitle>Select a tool</EmptyTitle>
                            <EmptyDescription className="w-full">
                                Choose a tool to get started.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <NativeSelect className="w-[95%]">
                                <NativeSelectOption value="">Choose a tool</NativeSelectOption>
                                <NativeSelectOption value="format">Format</NativeSelectOption>
                                <NativeSelectOption value="summarize">Summarize</NativeSelectOption>
                            </NativeSelect>
                        </EmptyContent>
                    </Empty>
                </SidebarContent>
            </Sidebar>
        </div>
    );
}

export default function FilePage() {
    const params = useParams();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const fileId = Array.isArray(params?.['file-id']) ? params['file-id'][0] : params?.['file-id'] as any;

    const [isLoading, setIsLoading] = useState(true);
    const [fileContent, setFileContent] = useState<Value>(initialEmptyValue);

    useEffect(() => {
        if (!fileId) return;

        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const file = files.find((f: any) => f.id === fileId);
                if (file && file.content) {
                    setFileContent(file.content);
                }
            }
        } catch (e) {
            console.error("Failed to load file", e);
        } finally {
            setIsLoading(false);
        }
    }, [fileId]);

    if (isLoading || !fileId) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="animate-spin size-5 text-muted-foreground/60" />
            </div>
        );
    }

    return <FileEditorInner initialContent={fileContent} fileId={fileId} />;
}