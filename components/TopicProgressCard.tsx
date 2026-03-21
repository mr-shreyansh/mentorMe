"use client";

import Link from 'next/link';
import { useProgress } from './ProgressProvider';
import { DsaTopicGroup } from '@/lib/dsa';
import { useMemo } from 'react';

export default function TopicProgressCard({ topic }: { topic: DsaTopicGroup }) {
  const { progress, isMounted } = useProgress();
  const completionPercentage = useMemo(() => {
    if (!isMounted || topic.totalProblems === 0) {
      return 0;
    }

    const completedCount = topic.problemIds.filter((problemId) => !!progress[problemId]?.date).length;
    return Math.round((completedCount / topic.totalProblems) * 100);
  }, [isMounted, progress, topic.problemIds, topic.totalProblems]);

  return (
    <Link href={`/dsa/${topic.id}`} className="block group relative">
      <div className="nm-flat hover:nm-button rounded-[2.5rem] p-8 transition-all duration-500 h-full flex flex-col group-hover:scale-[1.02] overflow-hidden relative">
        
        {/* Particle Fill Layer */}
        {isMounted && completionPercentage > 0 && (
          <div 
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out z-0 opacity-20 dark:opacity-10"
            style={{ 
              height: `${completionPercentage}%`,
              background: `
                radial-gradient(circle at 20% 30%, #f97316 2px, transparent 0),
                radial-gradient(circle at 70% 10%, #f97316 3px, transparent 0),
                radial-gradient(circle at 40% 80%, #fb923c 2px, transparent 0),
                radial-gradient(circle at 90% 60%, #f97316 4px, transparent 0),
                radial-gradient(circle at 10% 90%, #fb923c 3px, transparent 0),
                linear-gradient(to top, rgba(249, 115, 22, 0.2), transparent)
              `,
              backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
              animation: 'particles-float 10s infinite linear'
            }}
          />
        )}

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-(--heading-color)">{topic.title}</h3>
            {isMounted && completionPercentage > 0 && (
              <span className="text-xs font-black text-orange-500 nm-inset-sm px-3 py-1 rounded-full">
                {completionPercentage}%
              </span>
            )}
          </div>
          
          <p className="opacity-70 text-sm flex-1 leading-relaxed">{topic.description}</p>
          
          <div className="mt-8 flex items-center text-sm font-bold text-orange-500 group-hover:text-orange-400 transition-colors">
            Start Practicing <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes particles-float {
          0% { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          50% { background-position: 2% 5%, -2% 10%, 3% -5%, -3% 8%, 1% -7%, 0% 0%; }
          100% { background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
        }
      `}</style>
    </Link>
  );
}
