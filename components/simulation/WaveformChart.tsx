"use client";

import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function WaveformChart() {
  const { simulationResult } = useCanvasStore();

  // We map pure logic, or mock a waveform if simulation isn't real.
  const data = simulationResult?.probeData?.VP_OUT || [
    { time: 0, voltage: 0 },
    { time: 10, voltage: 5 },
    { time: 20, voltage: 0 },
    { time: 30, voltage: -5 },
    { time: 40, voltage: 0 },
  ];

  return (
    <div className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col relative">
      <div className="absolute top-2 left-2 z-10 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
        Oscilloscope
      </div>
      <div className="flex-1 mt-4 relative w-full min-h-[150px]">
        {simulationResult ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="time" stroke="#71717a" fontSize={10} tickFormatter={(val) => `${val}ms`} />
              <YAxis stroke="#71717a" fontSize={10} width={30} />
              <Area 
                type="monotone" 
                dataKey="voltage" 
                stroke="#fb923c" 
                fill="#ea580c" 
                fillOpacity={0.2} 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-xs text-zinc-500">
            <span className="text-2xl mb-2">∿</span>
            No signal detected
          </div>
        )}
      </div>
    </div>
  );
}
