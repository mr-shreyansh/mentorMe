"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type CompletedProblems = Record<string, string>; // problemId -> date string (YYYY-MM-DD)

interface ProgressContextType {
  completed: CompletedProblems;
  toggleProblem: (id: string) => void;
  isMounted: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<CompletedProblems>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const stored = localStorage.getItem("dsa-progress");
      if (stored) {
        try {
          setCompleted(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse progress", e);
        }
      }
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggleProblem = (id: string) => {
    setCompleted((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id]; // Un-checking removes the progress
      } else {
        // Checking adds it with today's date
        // Note: Formatting as YYYY-MM-DD
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        next[id] = `${yyyy}-${mm}-${dd}`;
      }
      localStorage.setItem("dsa-progress", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ProgressContext.Provider value={{ completed, toggleProblem, isMounted }}>
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
