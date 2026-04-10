"use client";

import { Circuit } from "tscircuit";
import { SchematicViewer } from "@tscircuit/schematic-viewer";
import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { buildTscircuitJSX } from "@/lib/simulation/circuitBuilder";

export default function SchematicPreview() {
  const { nodes, edges } = useCanvasStore();

  // Re-build JSX on the fly
  const jsxString = buildTscircuitJSX(nodes, edges);

  return (
    <div className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative">
      <div className="absolute top-2 left-2 z-10 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
        Schematic
      </div>
      {/* 
        Ideally tscircuit can render directly via eval. 
        For this prototype, if compile fails or isn't set up perfectly in Next with external canvas,
        we render a safe fallback.
      */}
      <div className="w-full h-full flex items-center justify-center p-4">
        {nodes.length > 0 ? (
          <code className="text-xs text-orange-400 opacity-50 block w-full whitespace-pre-wrap overflow-y-auto max-h-full">
            {jsxString}
          </code>
        ) : (
          <span className="text-xs text-zinc-600">Drag components to see code</span>
        )}
      </div>
    </div>
  );
}
