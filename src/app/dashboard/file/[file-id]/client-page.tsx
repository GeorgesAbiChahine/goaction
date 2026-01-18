"use client";

import { ActionItem } from "@/components/action-review-dialog";
import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { Button } from "@/components/ui/button";
import { ConversationBar } from '@/components/ui/conversation-bar';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select";
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
import { useParams, useRouter } from "next/navigation";
import { Value } from 'platejs';
import { usePlateEditor } from 'platejs/react';
import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "./editor";
import TranscriptInput from "./transcript-input";

const initialEmptyValue: Value = [
    {
        type: 'p',
        children: [{ text: '' }],
    },
];

interface ToolHistoryItem {
    id: string;
    tool: "format" | "summarize";
    timestamp: Date;
}

function FileEditorInner({ initialContent, fileId, initialHasFlowchart, fileTitle }: { initialContent: Value, fileId: string, initialHasFlowchart: boolean, fileTitle: string }) {

    const router = useRouter();
    const [hasFlowchart, setHasFlowchart] = useState(initialHasFlowchart); // Check logic

    const saveToFile = (newValue: Value) => {
        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const slateEditor = editor as any;
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const fullText = pendingSegments.map((s: any) => s.text).filter(Boolean).join(' ');

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

    const [isFormatting, setIsFormatting] = useState(false);
    const [selectedTool, setSelectedTool] = useState("");
    const [toolHistory, setToolHistory] = useState<ToolHistoryItem[]>([]);
    const [reviewActions, setReviewActions] = useState<ActionItem[] | null>(null);

    const checkHasContent = (v: Value) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return v.some((node: any) =>
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            node.children?.some((child: any) => child.text && child.text.trim().length > 0)
        );
    };

    const [hasContent, setHasContent] = useState(() => checkHasContent(initialContent));

    const handleToolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTool(e.target.value);
    };

    const runTool = async () => {
        if (!selectedTool) return;

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const text = editor.children
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .map((n: any) => n.children?.map((c: any) => c.text).join('') || '')
            .join('\n');

        if (!text.trim()) {
            console.warn("No text to process");
            return;
        }

        const tool = selectedTool;
        setIsFormatting(true);

        try {
            if (tool === "create_flowchart") {
                if (hasFlowchart) {
                    alert("Flowchart already exists! Redirecting to view...");
                    router.push(`/dashboard/file/${fileId}/flowchart`);
                    return;
                }

                const res = await fetch("/api/ai/flowchart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Flowchart generation failed");
                }
                const data = await res.json();

                if (data.nodes && data.edges) {
                    try {
                        const stored = localStorage.getItem('files');
                        if (stored) {
                            const files = JSON.parse(stored);
                            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                            const updatedFiles = files.map((f: any) =>
                                f.id === fileId ? { ...f, flowchart: data } : f
                            );
                            localStorage.setItem('files', JSON.stringify(updatedFiles));
                        }
                    } catch (e) {
                        console.error("Failed to save flowchart data", e);
                    }

                    setHasFlowchart(true);
                    // Navigate to flowchart page
                    router.push(`/dashboard/file/${fileId}/flowchart`);
                }
                return;
            }

            if (tool === "find_actions") {
                const res = await fetch("/api/ai/extract-actions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) throw new Error("Extraction failed");
                const data = await res.json();

                if (data.actions && Array.isArray(data.actions)) {
                    if (data.actions.length === 0) {
                        alert("No actions found in document.");
                    } else {
                        setReviewActions(data.actions);
                    }
                }
                return;
            }

            if (tool === "format" || tool === "summarize") {
                const endpoint = tool === "format" ? "/api/ai/format" : "/api/ai/summarize";
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `${tool === "format" ? "Formatting" : "Summarization"} failed`);
                }
                const data = await res.json();

                if (data && Array.isArray(data)) {
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    (editor as any).withoutNormalizing(() => {
                        editor.selection = null;
                        editor.children = data;
                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                        (editor as any).onChange();
                    });
                    saveToFile(data);

                    setHasContent(checkHasContent(data));

                    setToolHistory(prev => [{
                        id: Date.now().toString(),
                        tool: tool as "format" | "summarize",
                        timestamp: new Date(),
                    }, ...prev]);
                }
            }
        } catch (err) {
            console.error(`${tool} error:`, err);
        } finally {
            setIsFormatting(false);
            setSelectedTool("");
        }
    };

    const showPartial = scribe.isConnected && scribe.partialTranscript && scribe.partialTranscript !== lastCapturedPartialRef.current;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const allPendingText = [
        ...pendingSegments.map((s: any) => s.text),
        showPartial ? scribe.partialTranscript : null
    ].filter(Boolean).join(' ').trim();

    const handleDiscard = () => {
        setPendingSegments([]);
    };



    return (
        <div className="flex flex-row w-full relative h-full">
            <div className="w-full h-[calc(100%+52px)] -mt-13 relative">
                <Editor
                    editor={editor}
                    onChange={({ value }: { value: Value }) => {
                        saveToFile(value);
                        setHasContent(checkHasContent(value));
                    }}
                    hasFlowchart={hasFlowchart}
                    onOpenFlowchart={() => router.push(`/dashboard/file/${fileId}/flowchart`)}
                    fileTitle={fileTitle}
                />

                <div className="absolute bottom-6 w-full flex justify-center flex-col items-center gap-4 z-50 max-w-full pointer-events-none">
                    {allPendingText && (
                        <div className="bg-accent text-primary font-medium px-4 py-2 rounded-lg text-base text-center animate-in fade-in slide-in-from-bottom-2">
                            {allPendingText}
                        </div>
                    )}
                    {(isConnecting || scribe.isConnected || pendingSegments.length > 0) && (
                        <div className="pointer-events-auto rounded-lg overflow-hidden">
                            <TranscriptInput
                                isConnected={scribe.isConnected}
                                isConnecting={isConnecting}
                                onToggle={handleToggleActive}
                                error={scribeError}
                                onCommit={handleManualCommit}
                                onDiscard={handleDiscard}
                                pendingCount={pendingSegments.length}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Sidebar side="right" variant="floating">
                <SidebarContent className="p-2">
                    <SidebarGroupLabel>Toolbar</SidebarGroupLabel>
                    <Empty className="bg-muted border p-2">
                        <EmptyHeader>
                            <EmptyMedia variant="icon" className="bg-background border">
                                {isFormatting ? <Loader className="animate-spin size-5" /> : <ToolboxIcon />}
                            </EmptyMedia>
                            <EmptyTitle>Select a tool</EmptyTitle>
                            <EmptyDescription className="w-full">
                                Manual choose a tool.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <NativeSelect
                                className="w-[95%]"
                                value={selectedTool}
                                onChange={handleToolSelect}
                                disabled={isFormatting || !hasContent}
                            >
                                <NativeSelectOption value="">Choose a tool</NativeSelectOption>
                                <NativeSelectOption value="format">Format</NativeSelectOption>
                                <NativeSelectOption value="summarize">Summarize</NativeSelectOption>
                                <NativeSelectOption value="create_flowchart">Create Flowchart</NativeSelectOption>
                                <NativeSelectOption value="find_actions">Find Actions</NativeSelectOption>
                            </NativeSelect>
                            {selectedTool && (
                                <Button
                                    className="w-[95%] mt-2"
                                    onClick={runTool}
                                    disabled={isFormatting || !hasContent}
                                >
                                    {isFormatting ? <Loader className="animate-spin size-5" /> : "Run"}
                                </Button>
                            )}
                        </EmptyContent>
                    </Empty>

                    <ConversationBar
                        className="mt-2 w-full! min-w-full!"
                        agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ""}
                        onToolCall={async (toolName) => {
                            if (toolName === "recording") {
                                setTimeout(() => {
                                    handleToggleActive();
                                }, 500);
                                return "Starting recording.";
                            }

                            if (toolName === "create_flowchart") {
                                if (hasFlowchart) {
                                    alert("Flowchart already exists! Redirecting to view...");
                                    router.push(`/dashboard/file/${fileId}/flowchart`);
                                    return "Flowchart already generated, redirecting you to it.";
                                }

                                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                const text = editor.children
                                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                    .map((n: any) => n.children?.map((c: any) => c.text).join('') || '')
                                    .join('\n');
                                if (!text.trim()) return "Document is empty.";

                                setIsFormatting(true);
                                try {
                                    const res = await fetch("/api/ai/flowchart", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ text }),
                                    });
                                    if (!res.ok) throw new Error("API Failed");
                                    const data = await res.json();

                                    if (data.nodes && data.edges) {
                                        // Save to localstorage
                                        try {
                                            const stored = localStorage.getItem('files');
                                            if (stored) {
                                                const files = JSON.parse(stored);
                                                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                                const updatedFiles = files.map((f: any) =>
                                                    f.id === fileId ? { ...f, flowchart: data } : f
                                                );
                                                localStorage.setItem('files', JSON.stringify(updatedFiles));
                                            }
                                        } catch (e) { console.error(e); }

                                        router.push(`/dashboard/file/${fileId}/flowchart`);
                                        return "Flowchart created. Opening now.";
                                    }
                                    return "Failed to generate flowchart.";
                                } catch (e) {
                                    return "Error creating flowchart.";
                                } finally {
                                    setIsFormatting(false);
                                }
                            }

                            if (toolName === "find_actions") {
                                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                const text = editor.children
                                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                    .map((n: any) => n.children?.map((c: any) => c.text).join('') || '')
                                    .join('\n');

                                if (!text.trim()) return JSON.stringify({ actions: [] });

                                console.log("Scanning text:", text)


                                try {
                                    const res = await fetch("/api/ai/extract-actions", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ text }),
                                    });
                                    if (!res.ok) throw new Error("Extraction failed");
                                    const data = await res.json();
                                    console.log("Extraction API data:", data)
                                    return JSON.stringify(data);
                                } catch (e) {
                                    console.error("Action extraction error", e);
                                    return JSON.stringify({ actions: [] });
                                }
                            }

                            if (toolName !== "format" && toolName !== "summarize") return "Tool not found";

                            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                            const text = editor.children
                                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                .map((n: any) => n.children?.map((c: any) => c.text).join('') || '')
                                .join('\n');

                            if (!text.trim()) return "Document is empty.";

                            setIsFormatting(true);
                            try {
                                const endpoint = toolName === "format" ? "/api/ai/format" : "/api/ai/summarize";
                                const res = await fetch(endpoint, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ text }),
                                });

                                if (!res.ok) throw new Error("API Failed");
                                const data = await res.json();
                                if (data && Array.isArray(data)) {
                                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                    (editor as any).withoutNormalizing(() => {
                                        editor.selection = null;
                                        editor.children = data;
                                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                        (editor as any).onChange();
                                    });
                                    saveToFile(data);
                                    setHasContent(checkHasContent(data));
                                    setToolHistory(prev => [{
                                        id: Date.now().toString(),
                                        tool: toolName as "format" | "summarize",
                                        timestamp: new Date(),
                                    }, ...prev]);
                                    return "Success. Content updated.";
                                }
                                return "Failed to process data.";
                            } catch (e) {
                                console.error(e);
                                return "Error occurred.";
                            } finally {
                                setIsFormatting(false);
                            }
                        }}
                        reviewActions={reviewActions}
                        onReviewActionsChange={setReviewActions}
                    />
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
    const [hasFlowchart, setHasFlowchart] = useState(false);
    const [fileTitle, setFileTitle] = useState("Untitled");

    useEffect(() => {
        if (!fileId) return;

        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const file = files.find((f: any) => f.id === fileId);
                if (file) {
                    if (file.content) setFileContent(file.content);
                    if (file.flowchart) setHasFlowchart(true);
                    if (file.fileName) setFileTitle(file.fileName);
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

    return <FileEditorInner initialContent={fileContent} fileId={fileId} initialHasFlowchart={hasFlowchart} fileTitle={fileTitle} />;
}
