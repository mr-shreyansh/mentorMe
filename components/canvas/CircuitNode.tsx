"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";

export default function CircuitNode({ data, selected }: NodeProps) {
  const [editingValue, setEditingValue] = useState(data.value);
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative bg-zinc-900 border rounded-lg p-3 min-w-[100px] cursor-pointer
        ${selected ? "border-orange-500 shadow-orange-500/20 shadow-lg" : "border-zinc-700"}`}
    >
      {/* Handles logic based on component type */}
      {data.componentType === "ground" ? (
        <Handle type="target" position={Position.Top} id={`${data.name}.top`} className="w-3 h-3 bg-zinc-400" />
      ) : data.componentType === "voltageprobe" ? (
        <Handle type="target" position={Position.Bottom} id={`${data.name}.bottom`} className="w-3 h-3 bg-orange-400" />
      ) : data.componentType === "voltagesource" ? (
        <>
          <Handle type="target" position={Position.Left} id={`${data.name}.left`} className="w-3 h-3 bg-zinc-400" />
          <Handle type="source" position={Position.Right} id={`${data.name}.right`} className="w-3 h-3 bg-zinc-400" />
        </>
      ) : (
        <>
          {/* Default 2-pin components (Resistor, Diode, Capacitor) */}
          <Handle type="target" position={Position.Left} id={`${data.name}.left`} className="w-3 h-3 bg-zinc-400" />
          <Handle type="source" position={Position.Right} id={`${data.name}.right`} className="w-3 h-3 bg-zinc-400" />
        </>
      )}

      {/* Component body */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">{data.icon as React.ReactNode}</span>
        <span className="text-xs text-zinc-300 font-mono">{String(data.name)}</span>
        
        {data.value !== undefined && data.value !== null && data.value !== "" && (
          <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <button className="text-[10px] text-orange-400 cursor-pointer hover:underline bg-orange-500/10 px-1 py-0.5 rounded">
                {String(data.value) || "set value"}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg shadow-xl z-50 text-white w-48"
                sideOffset={5}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-zinc-400 font-bold uppercase">Set Value</p>
                  <input 
                    type="text" 
                    value={String(editingValue)} 
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => setOpen(false)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if(typeof data.onValueChange === "function") data.onValueChange(editingValue);
                        setOpen(false);
                      }}
                      className="text-xs bg-orange-600 hover:bg-orange-500 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <Popover.Arrow className="fill-zinc-800" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
    </div>
  );
}
