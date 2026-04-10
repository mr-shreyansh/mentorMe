import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  xp: number;
  level: number;
  badges: string[];
  completedTasks: string[];
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  completeTask: (slug: string) => void;
}

const XP_PER_LEVEL = 500;

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      badges: [],
      completedTasks: [],
      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
        set({ xp: newXP, level: newLevel });
      },
      unlockBadge: (badgeId) => {
        if (!get().badges.includes(badgeId)) {
          set((state) => ({ badges: [...state.badges, badgeId] }));
        }
      },
      completeTask: (slug) => {
        if (!get().completedTasks.includes(slug)) {
          set((state) => ({ completedTasks: [...state.completedTasks, slug] }));
        }
      },
    }),
    { name: "player-store" }
  )
);
