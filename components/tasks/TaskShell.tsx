"use client";

import ComponentPalette from "@/components/canvas/ComponentPalette";
import CircuitCanvas from "@/components/canvas/CircuitCanvas";
import TheoryCard from "./TheoryCard";
import ValidationFeedback from "./ValidationFeedback";
import CanvasToolbar from "@/components/canvas/CanvasToolbar";
import dynamic from "next/dynamic";
import { TaskDefinition, taskRegistry } from "@/lib/tasks/taskRegistry";
import { useEffect } from "react";
import { useCanvasStore } from "@/lib/store/useCanvasStore";

const SchematicPreview = dynamic(() => import("@/components/simulation/SchematicPreview"), { ssr: false });
const WaveformChart = dynamic(() => import("@/components/simulation/WaveformChart"), { ssr: false });

export default function TaskShell({ taskSlug }: { taskSlug: string }) {
  const { resetCanvas } = useCanvasStore();
  const task = taskRegistry[taskSlug];

  useEffect(() => {
    // Reset canvas on unmount or task change
    return () => resetCanvas();
  }, [task.slug, resetCanvas]);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-zinc-950 text-white overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
      {/* Left: Palette */}
      <ComponentPalette allowedComponents={task.allowedComponents} />

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <CanvasToolbar task={task} />
        <CircuitCanvas />
      </div>

      {/* Right: Output */}
      <div className="w-80 flex flex-col gap-4 p-4 bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
        <TheoryCard theory={task.theory} goal={task.goal} />
        <SchematicPreview />
        <WaveformChart />
        <ValidationFeedback task={task} />
      </div>
    </div>
  );
}
