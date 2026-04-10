"use client";

import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/lib/store/useCanvasStore";
import CircuitNode from "./CircuitNode";
import WireEdge from "./WireEdge";

const nodeTypes = { circuit: CircuitNode };
const edgeTypes = { wire: WireEdge };

export default function CircuitCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCanvasStore();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("componentType");
    if (type) {
      // In a real app we'd map container bounds to reactFlow projection
      // For now a simple offset from client cursor works for demo
      const position = {
        x: e.clientX - 350, // rough offset
        y: e.clientY - 150,
      };
      addNode(type, position);
    }
  };

  return (
    <div className="w-full relative h-[calc(100vh-4rem)] bg-zinc-950" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        connectionLineStyle={{ stroke: "#fb923c", strokeWidth: 2 }} // Orange theme
        defaultEdgeOptions={{ type: "wire", animated: false }}
      >
        <Background color="#27272a" gap={16} /> {/* zinc-800 approx */}
        <Controls />
      </ReactFlow>
    </div>
  );
}
