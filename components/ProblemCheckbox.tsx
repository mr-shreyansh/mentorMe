"use client";

import { useProgress } from './ProgressProvider';
import { Check } from 'lucide-react';

interface ProblemCheckboxProps {
  id: string;
  title: string;
  url: string;
}

export default function ProblemCheckbox({ id, title, url }: ProblemCheckboxProps) {
  const { completed, toggleProblem, isMounted } = useProgress();
  
  if (!isMounted) return <div className="h-20 nm-inset-sm rounded-[1.5rem] mb-4 animate-pulse"></div>;

  const isChecked = !!completed[id];

  return (
    <div id={`problem-${id}`} className={`flex items-center space-x-5 p-5 rounded-[1.5rem] transition-all duration-300 mb-4 ${isChecked ? 'nm-inset' : 'nm-flat hover:nm-button cursor-pointer'}`}>
      <button 
        onClick={() => toggleProblem(id)} 
        className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 focus:outline-none ${isChecked ? 'nm-flat text-emerald-500' : 'nm-inset-sm text-[var(--text-color)] opacity-30 group-hover:opacity-60'}`}
        aria-label={isChecked ? "Mark as uncompleted" : "Mark as completed"}
      >
        {isChecked && <Check className="w-6 h-6" />}
      </button>
      <div className="flex-1 flex items-center">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`flex-1 transition-all duration-300 font-bold ${isChecked ? 'text-[var(--text-color)] opacity-40 line-through' : 'text-[var(--heading-color)] hover:text-orange-500'}`}
          onClick={(e) => {
            // Checkbox clicking inside parent div should not trigger link
            e.stopPropagation();
          }}
        >
          {title}
        </a>
      </div>
    </div>
  );
}
