"use client";

import { FlowchartView } from "@/components/flowchart-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edge, Node } from "reactflow";
import { TextShimmer } from "../../../../../../components/motion-primitives/text-shimmer";

export default function FlowchartPage() {
    const params = useParams();
    const router = useRouter();
    const fileId = Array.isArray(params?.['file-id']) ? params['file-id'][0] : params?.['file-id'] as any;

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!fileId) return;
        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                const file = files.find((f: any) => f.id === fileId);
                if (file && file.flowchart) {
                    setNodes(file.flowchart.nodes || []);
                    setEdges(file.flowchart.edges || []);
                }
            }
        } catch (e) {
            console.error("Failed to load flowchart data", e);
        } finally {
            setIsLoading(false);
        }
    }, [fileId]);

    const handleSave = (newNodes: Node[], newEdges: Edge[]) => {
        try {
            const stored = localStorage.getItem('files');
            if (stored) {
                const files = JSON.parse(stored);
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                const updatedFiles = files.map((f: any) =>
                    f.id === fileId ? { ...f, flowchart: { nodes: newNodes, edges: newEdges } } : f
                );
                localStorage.setItem('files', JSON.stringify(updatedFiles));
            }
        } catch (e) {
            console.error("Failed to save flowchart positions", e);
        }
    };

    return (
        <div className="w-[calc(100%+47px)] h-[calc(100%+52px)] relative -left-7 -mt-13 bg-background">
            <div className="absolute top-4 left-4 z-10 p-2 flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/file/${fileId}`)}>
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Editor
                </Button>
            </div>

            <div className="flex-1 w-full h-full relative p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <TextShimmer className='font-mono text-sm' duration={1}>
                            Loading flowchart...
                        </TextShimmer>
                    </div>
                ) : nodes.length > 0 ? (
                    <FlowchartView
                        initialNodes={nodes}
                        initialEdges={edges}
                        className="w-full h-full bg-background"
                        onSave={handleSave}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No flowchart data found.
                    </div>
                )}
            </div>
        </div>
    );
}
