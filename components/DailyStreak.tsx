"use client";

import { useProgress } from './ProgressProvider';
import { Flame } from 'lucide-react';
import { useMemo } from 'react';

export default function DailyStreak() {
  const { progress, isMounted } = useProgress();

  const streak = useMemo(() => {
    if (!isMounted) return 0;
    
    const activeDates = Object.values(progress)
      .filter(p => !!p.date)
      .map(p => p.date as string);
      
    if (activeDates.length === 0) return 0;

    const uniqueDates = Array.from(new Set(activeDates)).sort((a, b) => b.localeCompare(a));
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if there was activity today or yesterday
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const next = new Date(uniqueDates[i + 1]);
        
        const diffTime = Math.abs(current.getTime() - next.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
        } else {
            break;
        }
    }
    
    return currentStreak;
  }, [progress, isMounted]);

  if (!isMounted) return <div className="h-20 w-48 nm-flat rounded-full animate-pulse"></div>;

  return (
    <div className="nm-flat rounded-full px-8 py-5 flex items-center gap-4 group hover:scale-105 transition-transform duration-300">
      <div className={`p-3 rounded-lg nm-inset-sm transition-colors duration-500 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
        <Flame className={`w-8 h-8 ${streak > 0 ? 'animate-bounce' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
      </div>
      <div>
        <div className="text-sm font-bold opacity-50 uppercase tracking-widest">Day Streak</div>
        <div className="text-3xl font-black text-(--heading-color)">
          {streak} <span className="text-lg opacity-50">days</span>
        </div>
      </div>
    </div>
  );
}
