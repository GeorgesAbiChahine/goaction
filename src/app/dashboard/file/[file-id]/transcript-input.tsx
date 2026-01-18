"use client"

import { Button } from "@/components/ui/button";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { IconPlayerRecord, IconPlayerRecordFilled, IconPlayerStop, IconPlayerStopFilled } from "@tabler/icons-react";
import { Loader } from "lucide-react";

interface TranscriptInputProps {
    isConnected: boolean;
    isConnecting: boolean;
    onToggle: () => void;
    error: string | null;
}

export default function TranscriptInput({
    isConnected,
    isConnecting,
    onToggle,
    error
}: TranscriptInputProps) {

    return (
        <div className="p-1 bg-muted border rounded-lg pl-2 flex gap-2 items-center">
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
            />

            <div className="flex flex-wrap justify-center gap-2">
                <Button
                    size="icon-sm"
                    variant={isConnected ? "destructive" : "outline"}
                    onClick={onToggle}
                    disabled={isConnecting}
                >
                    {isConnecting ? <Loader className="animate-spin" /> : (isConnected ? <IconPlayerStopFilled /> : <IconPlayerRecordFilled />)}
                </Button>
            </div>
        </div>
    )
}