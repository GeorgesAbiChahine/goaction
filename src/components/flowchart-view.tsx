"use client"

import { Card } from "@/components/ui/card"
import dagre from "dagre"
import * as React from "react"
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Handle,
    Node,
    Position,
    useEdgesState,
    useNodesState
} from "reactflow"
import "reactflow/dist/style.css"

function CustomNode({ data }: { data: { title: string; label: string } }) {

    return (
        <div className="relative">
            <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2 !-left-2" />
            <Card className="w-[350px] border-0.5 rounded-md overflow-hidden bg-card p-0! text-card-foreground shadow-sm">
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="text-md font-medium leading-tight">
                            {data.title}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-start leading-relaxed">
                        {data.label}
                    </p>
                </div>
            </Card>
            <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2 !-right-2" />
        </div>
    )
}

const nodeTypes = {
    card: CustomNode,
}

// Auto layout helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "LR") => {
    // Check if nodes already have positions (not 0,0)
    const hasPositions = nodes.some(n => n.position.x !== 0 || n.position.y !== 0)
    if (hasPositions) {
        return { nodes, edges }
    }

    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 350, height: 200 })
        node.type = 'card' // Force custom type
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        node.targetPosition = direction === "LR" ? Position.Left : Position.Top
        node.sourcePosition = direction === "LR" ? Position.Right : Position.Bottom
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            },
        }
    })

    return { nodes: layoutedNodes, edges }
}

interface FlowchartViewProps {
    initialNodes: Node[]
    initialEdges: Edge[]
    className?: string
    onSave?: (nodes: Node[], edges: Edge[]) => void
}

export function FlowchartView({ initialNodes, initialEdges, className, onSave }: FlowchartViewProps) {
    const { nodes: layoutedNodes, edges: layoutedEdges } = React.useMemo(() => {
        return getLayoutedElements(initialNodes, initialEdges)
    }, [initialNodes, initialEdges])

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    // Sync state if props change deeply
    React.useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(initialNodes, initialEdges)
        setNodes(newNodes)
        setEdges(newEdges)
    }, [initialNodes, initialEdges, setNodes, setEdges])

    const onNodeDragStop = React.useCallback((_: any, node: Node) => {
        // We need the latest nodes. Since onNodeDragStop is triggered after drag, 
        // 'nodes' state might be one frame behind or up to date depending on batching.
        // But actually, we want the node that *was* dragged to be updated in our set.
        // The safe way is to map over 'nodes' and replace the dragged node with the event node (which has new pos).
        // Actually, 'nodes' state *should* be updated by onNodesChange during the drag.
        // Let's assume 'nodes' is fresh enough or use a functional update pattern if we were setting state.
        // But here we need to call onSave.
        // Let's rely on React Flow's internal state management?
        // No, we useNodesState.

        // To be safe, let's construct the new nodes list using the passed 'node' (which has the new position)
        setNodes((nds) => {
            const updatedNodes = nds.map((n) => n.id === node.id ? { ...n, position: node.position } : n);
            if (onSave) {
                // Defer the save slightly or call it directly
                onSave(updatedNodes, edges);
            }
            return updatedNodes;
        });
    }, [edges, onSave, setNodes])

    return (
        <div className={className}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                className="bg-muted/10"
            >
                <Background gap={12} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    )
}
