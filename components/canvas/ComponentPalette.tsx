"use client";

import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { AVAILABLE_COMPONENTS } from "@/lib/tasks/taskRegistry";

export default function ComponentPalette({ allowedComponents }: { allowedComponents: string[] }) {
  const onDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-zinc-950 border-r border-zinc-800/50 w-56 h-full overflow-y-auto">
      <div className="mb-2">
        <h2 className="text-sm font-extrabold text-zinc-100 uppercase tracking-widest mb-1">Toolbox</h2>
        <p className="text-xs text-zinc-500">Drag items to the canvas</p>
      </div>
      
      <div className="flex flex-col gap-2">
        {allowedComponents.map((type) => {
          const meta = AVAILABLE_COMPONENTS[type];
          if (!meta) return null;

          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800/80 cursor-grab text-sm text-zinc-200 select-none transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                {meta.icon}
              </div>
              <span className="font-semibold">{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
