"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/app/utils/supabase/client";

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ProblemProgress {
  date?: string; // YYYY-MM-DD
  difficulty?: Difficulty;
  revisit?: boolean;
  lcSynced?: boolean; // true if solved via LeetCode sync
}

type ProgressData = Record<string, ProblemProgress>;

interface ProgressContextType {
  progress: ProgressData;
  toggleProblem: (id: string) => void;
  setDifficulty: (id: string, difficulty: Difficulty) => void;
  toggleRevisit: (id: string) => void;
  refreshProgress: () => Promise<void>;
  isMounted: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

async function mergeServerProgress(localProgress: ProgressData): Promise<ProgressData> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: rows } = await supabase
        .from("user_problem_map")
        .select("problem_id, is_solved, is_bookmarked, solved_at")
        .eq("user_id", user.id);

      if (rows && rows.length > 0) {
        for (const row of rows) {
          const pid = row.problem_id as string;
          const existing = localProgress[pid] || {};

          if (row.is_solved) {
            const solvedDate = row.solved_at
              ? new Date(row.solved_at).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10);

            localProgress[pid] = {
              ...existing,
              date: solvedDate,
              lcSynced: true,
            };
          }

          if (row.is_bookmarked) {
            localProgress[pid] = {
              ...localProgress[pid],
              revisit: true,
            };
          }
        }
        localStorage.setItem("dsa-progress-v2", JSON.stringify(localProgress));
      }
    }
  } catch (err) {
    console.error("Failed to load user_problem_map:", err);
  }
  return localProgress;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      let localProgress: ProgressData = {};
      const stored = localStorage.getItem("dsa-progress-v2");
      const legacy = localStorage.getItem("dsa-progress");

      if (stored) {
        try {
          localProgress = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse progress", e);
        }
      } else if (legacy) {
        try {
          const legacyData = JSON.parse(legacy);
          const migrated: ProgressData = {};
          Object.entries(legacyData).forEach(([id, date]) => {
            migrated[id] = { date: date as string };
          });
          localProgress = migrated;
          localStorage.setItem("dsa-progress-v2", JSON.stringify(migrated));
        } catch (e) {
          console.error("Failed to migrate legacy progress", e);
        }
      }

      localProgress = await mergeServerProgress(localProgress);
      setProgress(localProgress);
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const refreshProgress = useCallback(async () => {
    const stored = localStorage.getItem("dsa-progress-v2");
    let current: ProgressData = {};
    if (stored) {
      try { current = JSON.parse(stored); } catch { /* ignore */ }
    }
    const merged = await mergeServerProgress({ ...current });
    setProgress(merged);
  }, []);

  const saveProgress = (data: ProgressData) => {
    localStorage.setItem("dsa-progress-v2", JSON.stringify(data));
    setProgress(data);
  };

  const toggleProblem = (id: string) => {
    const next = { ...progress };
    if (next[id]?.date) {
      const { date, lcSynced, ...rest } = next[id];
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
    <ProgressContext.Provider value={{ progress, toggleProblem, setDifficulty, toggleRevisit, refreshProgress, isMounted }}>
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

