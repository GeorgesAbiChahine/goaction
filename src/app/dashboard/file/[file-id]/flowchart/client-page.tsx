"use client";

import { FlowchartView } from "@/components/flowchart-view";
import { Button } from "@/components/ui/button";
import { ConversationBar } from "@/components/ui/conversation-bar";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Edge, Node } from "reactflow";
import { TextShimmer } from "../../../../../../components/motion-primitives/text-shimmer";

export default function FlowchartClientPage() {
  const params = useParams();
  const router = useRouter();
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const fileId = Array.isArray(params?.["file-id"])
    ? params["file-id"][0]
    : (params?.["file-id"] as any);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  useEffect(() => {
    if (!fileId) return;
    try {
      const stored = localStorage.getItem("files");
      if (stored) {
        const files = JSON.parse(stored);
        // biome-ignore lint/suspicious/noExplicitAny: ignore
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

  const handleSave = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
      try {
        const stored = localStorage.getItem("files");
        if (stored) {
          const files = JSON.parse(stored);
          // biome-ignore lint/suspicious/noExplicitAny: ignore
          const updatedFiles = files.map((f: any) =>
            f.id === fileId
              ? { ...f, flowchart: { nodes: newNodes, edges: newEdges } }
              : f,
          );
          localStorage.setItem("files", JSON.stringify(updatedFiles));
        }
      } catch (e) {
        console.error("Failed to save flowchart positions", e);
      }
    },
    [fileId],
  );

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const handleToolCall = useCallback(
    async (toolName: string, params: any) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      if (toolName === "get_flowchart") {
        const simplified = {
          // biome-ignore lint/suspicious/noExplicitAny: ignore
          nodes: currentNodes.map((n: any) => ({
            id: n.id,
            title: n.data.title,
            label: n.data.label,
          })),
          edges: currentEdges.map((e) => ({
            source: e.source,
            target: e.target,
          })),
        };
        return JSON.stringify(simplified);
      }

      if (toolName === "add_node") {
        const { title, label, connectToId, connectFromId } = params;
        const newId = `node-${Date.now()}`;
        let position = { x: 100, y: 100 };
        if (connectToId) {
          const parent = currentNodes.find((n) => n.id === connectToId);
          if (parent) {
            position = { x: parent.position.x + 400, y: parent.position.y };
          }
        } else if (currentNodes.length > 0) {
          const last = currentNodes[currentNodes.length - 1];
          position = { x: last.position.x + 400, y: last.position.y };
        }

        const newNode: Node = {
          id: newId,
          type: "card",
          position,
          data: { title, label },
        };

        const newNodes = [...currentNodes, newNode];
        const newEdges = [...currentEdges];

        if (connectToId)
          newEdges.push({
            id: `e-${connectToId}-${newId}`,
            source: connectToId,
            target: newId,
          });
        if (connectFromId)
          newEdges.push({
            id: `e-${newId}-${connectFromId}`,
            source: newId,
            target: connectFromId,
          });

        handleSave(newNodes, newEdges);
        return `Added node ${newId}`;
      }

      if (toolName === "update_node") {
        const { nodeId, title, label } = params;
        const newNodes = currentNodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                title: title || n.data.title,
                label: label || n.data.label,
              },
            };
          }
          return n;
        });
        handleSave(newNodes, currentEdges);
        return `Updated node ${nodeId}`;
      }

      if (toolName === "delete_node") {
        const { nodeId } = params;
        const newNodes = currentNodes.filter((n) => n.id !== nodeId);
        const newEdges = currentEdges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        );
        handleSave(newNodes, newEdges);
        return `Deleted node ${nodeId}`;
      }

      return "Tool not handled";
    },
    [handleSave],
  );

  return (
    <div className="w-[calc(100%+47px)] h-[calc(100%+52px)] relative -left-7 -mt-13 bg-background">
      <div className="absolute top-4 left-4 z-10 p-2 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/file/${fileId}`)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Editor
        </Button>
        <div className="w-[300px]">
          <ConversationBar
            agentId={
              process.env.NEXT_PUBLIC_ELEVENLABS_FLOWCHART_AGENT_ID || ""
            }
            onToolCall={handleToolCall}
          />
        </div>
      </div>

      <div className="flex-1 w-full h-full relative p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <TextShimmer className="font-mono text-sm" duration={1}>
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
          <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
            <p>No flowchart data found.</p>
            <div className="w-[300px]">
              <ConversationBar
                agentId={
                  process.env.NEXT_PUBLIC_ELEVENLABS_FLOWCHART_AGENT_ID || ""
                }
                onToolCall={handleToolCall}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
