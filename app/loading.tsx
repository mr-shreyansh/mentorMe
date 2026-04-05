import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="nm-inset p-5 rounded-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
      <p className="text-sm font-bold opacity-60 text-foreground uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}
