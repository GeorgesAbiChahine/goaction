"use client"

import { Button } from "@/components/ui/button";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { IconPlayerRecordFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { Loader } from "lucide-react";

interface TranscriptInputProps {
    isConnected: boolean;
    isConnecting: boolean;
    onToggle: () => void;
    error: string | null;
    onCommit: () => void;
    onDiscard: () => void;
    pendingCount: number;
}

export default function TranscriptInput({
    isConnected,
    isConnecting,
    onToggle,
    error,
    onCommit,
    onDiscard,
    pendingCount
}: TranscriptInputProps) {

    return (
        <div className="p-0.5 px-0.5 bg-muted border rounded-lg pl-2     flex gap-2 items-center">
            <LiveWaveform
                active={isConnected}
                processing={isConnecting}
                height={20}
                barWidth={3}
                barGap={2}
                mode={isConnected ? "scrolling" : "static"}
                fadeEdges={true}
                barColor="gray"
                historySize={120}
                className="w-[120px]"
            />

            <div className="flex flex-wrap justify-center gap-1">

                <Button
                    size="icon-sm"
                    className="size-6"
                    variant={isConnected ? "destructive" : "outline"}
                    onClick={onToggle}
                    disabled={isConnecting}
                >
                    {isConnecting ? <Loader className="animate-spin size-3" /> : (isConnected ? <IconPlayerStopFilled className="size-3" /> : <IconPlayerRecordFilled className="size-3 text-destructive" />)}
                </Button>
                {pendingCount > 0 && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onDiscard}
                            className="h-6 px-2 text-xs"
                        >
                            Discard
                        </Button>
                        <Button
                            size="sm"
                            onClick={onCommit}
                            className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white border-none"
                        >
                            Commit
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}