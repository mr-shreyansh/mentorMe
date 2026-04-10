"use client";

import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { TaskDefinition } from "@/lib/tasks/taskRegistry";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  task: TaskDefinition;
}

export default function ValidationFeedback({ task }: Props) {
  // It relies on SimulationResult. Wait, we usually get feedback injected from Toolbar toast.
  // We can just subscribe to the last validated result or simply display a small static feedback section.
  const { simulationResult, nodes } = useCanvasStore();

  // We can do real-time lightweight topological hints if we want, but usually validation happens on 'Simulate'.
  // For the actual project shell, we'll just show component counters
  
  return (
    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl mt-auto">
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
        Circuit Status
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Nodes placed:</span>
          <span className="text-zinc-100 font-mono">{nodes.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Validation:</span>
          {!simulationResult ? (
            <span className="text-orange-400 flex items-center gap-1">
              <AlertCircle size={12} /> Pending Simulation
            </span>
          ) : (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Last Run Logged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
