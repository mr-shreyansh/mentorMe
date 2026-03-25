"use client";

import { useState, useTransition } from "react";
import {
  Github,
  Trophy,
  Code,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { type CodeforcesUser, type CodeforcesContest } from "@/lib/codeforces";
import { type LeetCodeUser } from "@/lib/leetcode";
import { connectCodeforcesHandle } from "@/app/actions/codeforces";
import { connectLeetcodeHandle } from "@/app/actions/leetcode";

export default function PlatformsDashboard({
  codeforcesUser,
  codeforcesContests,
  githubUsername = "",
  leetcodeUser,
}: {
  codeforcesUser?: CodeforcesUser | null;
  codeforcesContests?: CodeforcesContest[];
  githubUsername?: string | null;
  leetcodeUser?: LeetCodeUser | null;
}) {
  // Codeforces state
  const [cfHandle, setCfHandle] = useState("");
  const [isCfConnecting, setIsCfConnecting] = useState(false);
  const [isCfPending, startCfTransition] = useTransition();
  const [errorCf, setErrorCf] = useState("");

  // LeetCode state
  const [lcHandle, setLcHandle] = useState("");
  const [isLcConnecting, setIsLcConnecting] = useState(false);
  const [isLcPending, startLcTransition] = useTransition();
  const [errorLc, setErrorLc] = useState("");

  const handleCfConnect = () => {
    if (!cfHandle.trim()) return;
    setErrorCf("");
    startCfTransition(async () => {
      const res = await connectCodeforcesHandle(cfHandle.trim());
      if (!res?.success) {
        setErrorCf(res?.error || "Failed to connect.");
      } else {
        setIsCfConnecting(false);
        setCfHandle("");
      }
    });
  };

  const handleLcConnect = () => {
    if (!lcHandle.trim()) return;
    setErrorLc("");
    startLcTransition(async () => {
      const res = await connectLeetcodeHandle(lcHandle.trim());
      if (!res?.success) {
        setErrorLc(res?.error || "Failed to connect.");
      } else {
        setIsLcConnecting(false);
        setLcHandle("");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <h2 className="text-2xl font-bold flex items-center text-(--heading-color)">
        <span className="nm-inset-sm text-orange-500 p-3 rounded-lg mr-5">
          <Trophy className="w-6 h-6" />
        </span>
        Profiles & Contests
      </h2>

      <div className="space-y-6">
        {/* GitHub Card */}
        <div className="nm-flat rounded-lg p-6 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="nm-inset-sm p-2 rounded-md text-slate-700 dark:text-slate-300">
                <Github size={20} />
              </div>
              <span className="font-bold">GitHub</span>
            </div>
            <a
              href="https://github.com/shreyansh-gaikwad"
              target="_blank"
              rel="noreferrer"
              className="text-orange-500 hover:text-orange-400"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-xs opacity-60">
            Connected to <span className="font-mono text-orange-500">{githubUsername || "mr-shreyansh"}</span>
          </p>
        </div>

        {/* Codeforces Card */}
        <div className="nm-flat rounded-lg p-6 space-y-4 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`nm-inset-sm p-2 rounded-md ${codeforcesUser ? "text-blue-500" : "text-slate-500"}`}
              >
                <Code size={20} />
              </div>
              <span className="font-bold">Codeforces</span>
            </div>
            {codeforcesUser ? (
              <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">
                {codeforcesUser.rank || "Unrated"}
              </span>
            ) : (
              <span className="text-xs font-black text-slate-500 bg-slate-500/10 px-2 py-1 rounded-md">
                Not Connected
              </span>
            )}
          </div>

          {codeforcesUser ? (
            <>
              <div className="flex justify-between items-end border-b border-orange-500/10 pb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Current Rating
                  </div>
                  <div className="text-2xl font-black">
                    {codeforcesUser.rating || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Handle
                  </div>
                  <div className="font-mono text-sm text-orange-500">
                    {codeforcesUser.handle}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold flex items-center gap-1">
                  <Calendar size={10} /> Upcoming Contests
                </div>
                {codeforcesContests?.length ? (
                  codeforcesContests.map((c, i) => {
                    const d = new Date(c.startTimeSeconds * 1000);
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="opacity-70 truncate mr-2">
                          {c.name}
                        </span>
                        <span suppressHydrationWarning className="font-bold text-orange-500 shrink-0">
                          {d.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs opacity-50">No upcoming contests</div>
                )}
              </div>
            </>
          ) : (
            <div className="pt-2">
              {!isCfConnecting ? (
                <button
                  onClick={() => setIsCfConnecting(true)}
                  className="w-full py-2 nm-button rounded-md text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Connect Codeforces
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Handle"
                      value={cfHandle}
                      onChange={(e) => setCfHandle(e.target.value)}
                      className="flex-1 bg-transparent border-0 ring-0 outline-none nm-inset-sm px-3 py-2 rounded-md text-sm text-(--heading-color)"
                    />
                    <button
                      onClick={handleCfConnect}
                      disabled={isCfPending || !cfHandle.trim()}
                      className="nm-button px-4 rounded-md text-sm font-bold text-blue-500 disabled:opacity-50"
                    >
                      {isCfPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  {errorCf && (
                    <div className="text-xs text-red-500 font-bold">
                      {errorCf}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsCfConnecting(false);
                      setErrorCf("");
                      setCfHandle("");
                    }}
                    className="text-xs opacity-50 hover:opacity-100 w-full text-center"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LeetCode Card */}
        <div className="nm-flat rounded-lg p-6 space-y-4 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`nm-inset-sm p-2 rounded-md ${leetcodeUser ? "text-yellow-500" : "text-slate-500"}`}
              >
                <Trophy size={20} />
              </div>
              <span className="font-bold">LeetCode</span>
            </div>
            {leetcodeUser ? (
              <span className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">
                #{leetcodeUser.ranking.toLocaleString()}
              </span>
            ) : (
              <span className="text-xs font-black text-slate-500 bg-slate-500/10 px-2 py-1 rounded-md">
                Not Connected
              </span>
            )}
          </div>

          {leetcodeUser ? (
            <>
              <div className="flex justify-between items-end border-b border-orange-500/10 pb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Total Solved
                  </div>
                  <div className="text-2xl font-black">
                    {leetcodeUser.totalSolved}
                    <span className="text-sm font-medium opacity-40 ml-1">
                      / {leetcodeUser.totalQuestions}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Handle
                  </div>
                  <div className="font-mono text-sm text-orange-500">
                    {leetcodeUser.username}
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="nm-inset-sm rounded-md p-3 text-center">
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Easy
                  </div>
                  <div className="text-lg font-black text-green-500">
                    {leetcodeUser.easySolved}
                  </div>
                  <div className="text-[10px] opacity-40">
                    / {leetcodeUser.easyTotal}
                  </div>
                </div>
                <div className="nm-inset-sm rounded-md p-3 text-center">
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Medium
                  </div>
                  <div className="text-lg font-black text-yellow-500">
                    {leetcodeUser.mediumSolved}
                  </div>
                  <div className="text-[10px] opacity-40">
                    / {leetcodeUser.mediumTotal}
                  </div>
                </div>
                <div className="nm-inset-sm rounded-md p-3 text-center">
                  <div className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    Hard
                  </div>
                  <div className="text-lg font-black text-red-500">
                    {leetcodeUser.hardSolved}
                  </div>
                  <div className="text-[10px] opacity-40">
                    / {leetcodeUser.hardTotal}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-2">
              {!isLcConnecting ? (
                <button
                  onClick={() => setIsLcConnecting(true)}
                  className="w-full py-2 nm-button rounded-md text-sm font-bold text-yellow-500 hover:text-yellow-600 transition-colors"
                >
                  Connect LeetCode
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Username"
                      value={lcHandle}
                      onChange={(e) => setLcHandle(e.target.value)}
                      className="flex-1 bg-transparent border-0 ring-0 outline-none nm-inset-sm px-3 py-2 rounded-md text-sm text-(--heading-color)"
                    />
                    <button
                      onClick={handleLcConnect}
                      disabled={isLcPending || !lcHandle.trim()}
                      className="nm-button px-4 rounded-md text-sm font-bold text-yellow-500 disabled:opacity-50"
                    >
                      {isLcPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  {errorLc && (
                    <div className="text-xs text-red-500 font-bold">
                      {errorLc}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsLcConnecting(false);
                      setErrorLc("");
                      setLcHandle("");
                    }}
                    className="text-xs opacity-50 hover:opacity-100 w-full text-center"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
