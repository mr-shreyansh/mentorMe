"use client";

import { TaskDefinition } from "@/lib/tasks/taskRegistry";
import { BookOpen, Target } from "lucide-react";

interface Props {
  theory: TaskDefinition["theory"];
  goal: string;
}

export default function TheoryCard({ theory, goal }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Goal Card */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Target size={14} /> Objective
        </h3>
        <p className="text-sm text-orange-100/80 leading-relaxed font-medium">
          {goal}
        </p>
      </div>

      {/* Theory Card */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <BookOpen size={14} /> Theory
        </h3>
        <p className="text-sm text-zinc-300 leading-relaxed mb-4">
          {theory.summary}
        </p>
        
        {theory.keyFormulas.length > 0 && (
          <div className="flex flex-col gap-2">
            {theory.keyFormulas.map((f, i) => (
              <div key={i} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/50 flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">{f.label}</span>
                <code className="text-xs text-green-400 font-mono mt-0.5">{f.formula}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
