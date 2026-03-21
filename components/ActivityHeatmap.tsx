"use client";

import React, { cloneElement } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { useProgress } from './ProgressProvider';
import { Flame } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Activity {
  date: string;
  count: number;
  level: number;
}

export default function ActivityHeatmap() {
  const { progress, isMounted } = useProgress();
  const { theme } = useTheme();

  if (!isMounted) return <div className="h-64 nm-flat rounded-[3rem] animate-pulse"></div>;

  const dailyCounts: Record<string, number> = {};
  Object.values(progress).forEach((p) => {
    if (p.date) {
      dailyCounts[p.date] = (dailyCounts[p.date] || 0) + 1;
    }
  });

  const today = new Date();
  const data: Activity[] = [];
  
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const count = dailyCounts[dateStr] || 0;
    
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 4) level = 2;
    else if (count > 4 && count <= 6) level = 3;
    else if (count > 6) level = 4;
    
    data.push({
      date: dateStr,
      count,
      level,
    });
  }

  // Neumorphic coloring uses orange highlights to match UI accents. Green is reserved for completion elsewhere.
  const calendarTheme: ThemeInput = {
    light: ['#cbd5e1', '#fdba74', '#fb923c', '#ea580c', '#9a3412'],
    dark: ['#1e293b', '#9a3412', '#c2410c', '#ea580c', '#fb923c']
  };

  const isDark = theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="nm-flat rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-8 flex items-center text-[var(--heading-color)]">
        <span className="nm-inset-sm text-orange-500 p-3 rounded-2xl mr-5">
          <Flame className="w-6 h-6" />
        </span>
        Consistency Progress
      </h2>
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-max">
          <ActivityCalendar 
            data={data} 
            theme={calendarTheme}
            colorScheme={isDark ? "dark" : "light"}
            renderBlock={(block, activity) => (
              cloneElement(block as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                title: `${activity.count} problem${activity.count !== 1 ? 's' : ''} solved on ${activity.date}`
              })
            )}
            labels={{
              totalCount: '{{count}} problems solved in the last half year',
            }}
          />
        </div>
      </div>
    </div>
  );
}
