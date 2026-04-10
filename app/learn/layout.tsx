import { BadgeUnlock, XPBar } from "@/components/gamification/XPBar";
import { Zap } from "lucide-react";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/20 overflow-hidden relative overflow-y-auto w-full">
      
      {/* Top Navbar for Gamification Context */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800/50 bg-background sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-(--heading-color) tracking-tight">
              Electronics Lab
            </h1>
            <p className="text-sm text-foreground opacity-60 font-medium">
              Interactive Circuit Sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <BadgeUnlock />
          <XPBar />
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
