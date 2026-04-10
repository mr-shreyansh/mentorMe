"use client";

import { usePlayerStore } from "@/lib/store/usePlayerStore";
import { Zap, ShieldCheck } from "lucide-react";

export function XPBar() {
  const { xp, level } = usePlayerStore();
  const xpForNextLevel = level * 500;
  const xpCurrentLevel = xp % 500;
  const progress = (xpCurrentLevel / 500) * 100;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm">
      <div className="flex flex-col items-center justify-center p-1.5 bg-orange-500/20 rounded-lg">
        <Zap size={16} className="text-orange-500" />
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white tracking-widest uppercase">Level {level}</span>
          <span className="text-xs font-bold text-orange-500">{xp} / {xpForNextLevel} XP</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

export function BadgeUnlock() {
  const { badges } = usePlayerStore();
  
  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 text-green-400">
        <ShieldCheck size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-zinc-500 font-bold uppercase">Latest Badge</span>
        <span className="text-xs text-white font-semibold">{badges[badges.length - 1]}</span>
      </div>
    </div>
  );
}
