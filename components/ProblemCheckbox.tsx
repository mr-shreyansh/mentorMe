"use client";

import { useProgress, Difficulty } from './ProgressProvider';
import { useEffect, useMemo, useState } from 'react';
import { Check, Bookmark, ChevronDown, Lightbulb, X } from 'lucide-react';

interface ProblemCheckboxProps {
  id: string;
  title: string;
  url: string;
  difficulty: number | null;
  platform: string;
  tags: string[];
  companies: string[];
  hints: string[];
  solution: string;
}

export default function ProblemCheckbox({
  id,
  title,
  url,
  difficulty: dbDifficulty,
  platform,
  tags,
  companies,
  hints,
  solution,
}: ProblemCheckboxProps) {
  const { progress, toggleProblem, setDifficulty, toggleRevisit, isMounted } = useProgress();
  const problemData = progress[id] || {};
  const isChecked = !!problemData.date;
  const selectedDifficulty = problemData.difficulty;
  const isRevisit = !!problemData.revisit;
  const [isExpanded, setIsExpanded] = useState(false);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const hasSolution = solution.trim().length > 0;
  const hasMeta = tags.length > 0 || companies.length > 0 || platform !== 'Unknown';
  const difficultyLabel = useMemo(() => {
    if (dbDifficulty === null) {
      return 'Unrated';
    }

    if (dbDifficulty <= 2) {
      return 'Easy';
    }

    if (dbDifficulty <= 4) {
      return 'Medium';
    }

    return 'Hard';
  }, [dbDifficulty]);

  useEffect(() => {
    if (!isSolutionOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSolutionOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isSolutionOpen]);

  if (!isMounted) return <div className="h-26 nm-inset-sm rounded-3xl mb-4 animate-pulse"></div>;

  const difficultyColors = {
    easy: 'text-emerald-500',
    medium: 'text-amber-500',
    hard: 'text-rose-500'
  };

  return (
    <div 
      id={`problem-${id}`} 
      className={`group flex items-start p-5 rounded-3xl transition-all duration-300 mb-4 border-2 ${
        isRevisit 
          ? 'bg-amber-500/5 border-amber-400/30!' 
          : 'border-transparent'
      } ${isChecked ? 'nm-inset' : 'nm-flat hover:nm-button'}`}
    >
      <button 
        onClick={() => toggleProblem(id)} 
        className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 focus:outline-none mt-1 ${
          isChecked ? 'nm-flat text-emerald-500' : 'nm-inset-sm text-foreground opacity-30 group-hover:opacity-60'
        }`}
        aria-label={isChecked ? "Mark as uncompleted" : "Mark as completed"}
      >
        {isChecked && <Check className="w-6 h-6" />}
      </button>

      <div className="flex-1 ml-5 flex flex-col gap-4 min-w-0">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`transition-all duration-300 font-bold block whitespace-normal ${
            isChecked ? 'text-foreground opacity-40 line-through' : 'text-(--heading-color) hover:text-orange-500'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {title}
        </a>

        <div className="flex items-center gap-4 shrink-0">
          {/* Difficulty Selectors */}
          <div className="flex items-center nm-inset-sm p-0.5 rounded-xl h-8">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(id, d)}
                className={`px-3 h-full text-[9px] font-black uppercase tracking-tighter rounded-[10px] transition-all flex items-center justify-center ${
                  selectedDifficulty === d 
                    ? `nm-flat ${difficultyColors[d]}` 
                    : 'text-foreground opacity-30 hover:opacity-100 hover:text-orange-500'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Revisit Toggle */}
          <button
            onClick={() => toggleRevisit(id)}
            className={`shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center transition-all ${
              isRevisit 
                ? 'nm-flat text-amber-500' 
                : 'nm-inset-sm text-foreground opacity-30 hover:opacity-100 dark:hover:text-amber-500'
            }`}
            title="Mark for revisit"
          >
            <Bookmark size={14} className={isRevisit ? 'fill-amber-500' : ''} />
          </button>

          <button
            onClick={() => setIsExpanded((current) => !current)}
            className="shrink-0 h-8 px-3 rounded-[10px] nm-inset-sm text-xs font-bold uppercase tracking-tight text-foreground opacity-70 hover:opacity-100 flex items-center gap-1"
            title="Toggle details"
          >
            Details
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isExpanded && (
          <div className="nm-inset-sm rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase font-black tracking-wider opacity-60">Platform</span>
              <span className="text-xs font-semibold nm-flat px-2.5 py-1 rounded-full">{platform}</span>
              <span className="text-[10px] uppercase font-black tracking-wider opacity-60 ml-2">DB Difficulty</span>
              <span className="text-xs font-semibold nm-flat px-2.5 py-1 rounded-full">{difficultyLabel}</span>
            </div>

            {hasMeta && (
              <>
                {tags.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-60 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={`${id}-tag-${tag}`} className="text-xs nm-flat px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {companies.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-60 mb-2">Companies</p>
                    <div className="flex flex-wrap gap-2">
                      {companies.map((company) => (
                        <span key={`${id}-company-${company}`} className="text-xs nm-flat px-2.5 py-1 rounded-full">{company}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-3">
              <p className="text-[10px] uppercase font-black tracking-wider opacity-60">Hints</p>
              {revealedHintsCount > 0 ? (
                <ol className="space-y-2 list-decimal list-inside">
                  {hints.slice(0, revealedHintsCount).map((hint, index) => (
                    <li key={`${id}-hint-${index}`} className="text-sm opacity-90">{hint}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm opacity-60">No hints revealed yet.</p>
              )}

              <button
                onClick={() => setRevealedHintsCount((count) => Math.min(count + 1, hints.length))}
                disabled={revealedHintsCount >= hints.length || hints.length === 0}
                className="h-9 px-4 rounded-xl nm-flat disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wide flex items-center gap-2"
              >
                <Lightbulb className="w-3 h-3" />
                {revealedHintsCount >= hints.length ? 'All Hints Revealed' : 'Show Next Hint'}
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setIsSolutionOpen(true)}
                disabled={!hasSolution}
                className="h-9 px-4 rounded-xl nm-flat disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wide"
              >
                View Solution
              </button>
            </div>
          </div>
        )}
      </div>

      {isSolutionOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSolutionOpen(false)}
        >
          <div
            className="w-full max-w-2xl nm-flat rounded-3xl p-6 md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase font-black tracking-wider opacity-60">Solution</p>
                <h4 className="text-xl font-bold text-(--heading-color) mt-1">{title}</h4>
              </div>
              <button
                onClick={() => setIsSolutionOpen(false)}
                className="w-9 h-9 rounded-xl nm-inset-sm flex items-center justify-center"
                aria-label="Close solution popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="nm-inset-sm rounded-2xl p-4 md:p-5 max-h-[60vh] overflow-auto">
              <pre className="text-sm leading-6 whitespace-pre-wrap font-mono">{solution}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
