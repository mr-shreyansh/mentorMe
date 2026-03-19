"use client";

import { Github, Trophy, Code, Calendar, ExternalLink } from 'lucide-react';

const MOCK_CODEFORCES = {
  handle: "shreyansh_g",
  rating: 1450,
  rank: "Specialist",
  upcoming: [
    { name: "Codeforces Round #930 (Div. 2)", date: "Mar 25, 2026" },
    { name: "Educational Codeforces Round 165", date: "Apr 02, 2026" }
  ]
};

const MOCK_LEETCODE = {
  handle: "shreyansh_lc",
  solved: 452,
  contestRating: 1820,
  upcoming: "Biweekly Contest 128 (Mar 23)"
};

export default function PlatformsDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <h2 className="text-2xl font-bold flex items-center text-(--heading-color)">
        <span className="nm-inset-sm text-orange-500 p-3 rounded-2xl mr-5">
            <Trophy className="w-6 h-6" />
        </span>
        Profiles & Contests
      </h2>

      <div className="space-y-6">
        {/* GitHub Card */}
        <div className="nm-flat rounded-4xl p-6 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="nm-inset-sm p-2 rounded-xl text-slate-700 dark:text-slate-300">
                <Github size={20} />
              </div>
              <span className="font-bold">GitHub</span>
            </div>
            <a href="https://github.com/shreyansh-gaikwad" target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-400">
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-xs opacity-60">Connected to <span className="font-mono text-orange-500">mr-shreyansh</span></p>
        </div>

        {/* Codeforces Card */}
        <div className="nm-flat rounded-4xl p-6 space-y-4 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="nm-inset-sm p-2 rounded-xl text-blue-500">
                <Code size={20} />
              </div>
              <span className="font-bold">Codeforces</span>
            </div>
            <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{MOCK_CODEFORCES.rank}</span>
          </div>
          <div className="flex justify-between items-end border-b border-orange-500/10 pb-4">
             <div>
                <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">Current Rating</div>
                <div className="text-2xl font-black">{MOCK_CODEFORCES.rating}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">Handle</div>
                <div className="font-mono text-sm text-orange-500">{MOCK_CODEFORCES.handle}</div>
             </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold flex items-center gap-1">
                <Calendar size={10} /> Upcoming Contests
            </div>
            {MOCK_CODEFORCES.upcoming.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                    <span className="opacity-70 truncate mr-2">{c.name}</span>
                    <span className="font-bold text-orange-500 shrink-0">{c.date}</span>
                </div>
            ))}
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="nm-flat rounded-4xl p-6 space-y-4 hover:scale-[1.02] transition-transform duration-300">
           <div className="flex items-center gap-3">
              <div className="nm-inset-sm p-2 rounded-xl text-yellow-500">
                 <Trophy size={20} />
              </div>
              <span className="font-bold">LeetCode</span>
           </div>
           <div className="grid grid-cols-2 gap-4 border-b border-orange-500/10 pb-4">
              <div>
                <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">Solved</div>
                <div className="text-2xl font-black text-yellow-500">{MOCK_LEETCODE.solved}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">Contest Rating</div>
                <div className="text-2xl font-black text-orange-500">{MOCK_LEETCODE.contestRating}</div>
              </div>
           </div>
           <div className="text-xs">
              <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold mb-1">Next Up</div>
              <div className="font-bold text-orange-500">{MOCK_LEETCODE.upcoming}</div>
           </div>
        </div>
      </div>
    </div>
  );
}
