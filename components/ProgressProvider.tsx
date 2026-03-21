"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ProblemProgress {
  date?: string; // YYYY-MM-DD
  difficulty?: Difficulty;
  revisit?: boolean;
}

type ProgressData = Record<string, ProblemProgress>;

interface ProgressContextType {
  progress: ProgressData;
  toggleProblem: (id: string) => void;
  setDifficulty: (id: string, difficulty: Difficulty) => void;
  toggleRevisit: (id: string) => void;
  isMounted: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const stored = localStorage.getItem("dsa-progress-v2");
      const legacy = localStorage.getItem("dsa-progress");
      
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse progress", e);
        }
      } else if (legacy) {
        // Migrate from v1 to v2
        try {
          const legacyData = JSON.parse(legacy);
          const migrated: ProgressData = {};
          Object.entries(legacyData).forEach(([id, date]) => {
            migrated[id] = { date: date as string };
          });
          setProgress(migrated);
          localStorage.setItem("dsa-progress-v2", JSON.stringify(migrated));
        } catch (e) {
          console.error("Failed to migrate legacy progress", e);
        }
      }
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const saveProgress = (data: ProgressData) => {
    localStorage.setItem("dsa-progress-v2", JSON.stringify(data));
    setProgress(data);
  };

  const toggleProblem = (id: string) => {
    const next = { ...progress };
    if (next[id]?.date) {
      // If it exists, just remove the date but keep other metadata? 
      // Or remove entirely if no other metadata?
      const { date, ...rest } = next[id];
      if (Object.keys(rest).length === 0) {
        delete next[id];
      } else {
        next[id] = rest;
      }
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      next[id] = { ...next[id], date: `${yyyy}-${mm}-${dd}` };
    }
    saveProgress(next);
  };

  const setDifficulty = (id: string, difficulty: Difficulty) => {
    const next = { ...progress };
    next[id] = { ...next[id], difficulty };
    saveProgress(next);
  };

  const toggleRevisit = (id: string) => {
    const next = { ...progress };
    next[id] = { ...next[id], revisit: !next[id]?.revisit };
    saveProgress(next);
  };

  return (
    <ProgressContext.Provider value={{ progress, toggleProblem, setDifficulty, toggleRevisit, isMounted }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
