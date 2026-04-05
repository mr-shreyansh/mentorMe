import Link from "next/link";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import DailyStreak from "@/components/DailyStreak";
import PlatformsDashboard from "@/components/PlatformsDashboard";
import { BookOpen, Code2, Terminal } from "lucide-react";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

import {
  getCodeforcesUserInfo,
  getUpcomingCodeforcesContests,
  type CodeforcesUser,
  type CodeforcesContest,
} from "@/lib/codeforces";
import {
  getLeetCodeUserProfile,
  type LeetCodeUser,
} from "@/lib/leetcode";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let codeforcesUser: CodeforcesUser | null = null;
  let codeforcesContests: CodeforcesContest[] | undefined = undefined;
  let githubUsername: string | undefined = undefined;
  let leetcodeUser: LeetCodeUser | null = null;

  if (user) {
    githubUsername =
      user.user_metadata?.user_name || user.user_metadata?.preferred_username;
    const { data: userData } = await supabase
      .from("users")
      .select("codeforces_handle, leetcode_handle")
      .eq("id", user.id)
      .single();
    
    if (userData?.codeforces_handle) {
      codeforcesUser = await getCodeforcesUserInfo(userData.codeforces_handle);
      if (codeforcesUser) {
        codeforcesContests = await getUpcomingCodeforcesContests();
      }
    }

    if (userData?.leetcode_handle) {
      leetcodeUser = await getLeetCodeUserProfile(userData.leetcode_handle);
    }
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      {/* Top Row: Welcome & Steak Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 nm-flat rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-(--heading-color) mb-3 transition-colors">
              Welcome back, {user?.user_metadata?.user_name || "Developer"}
            </h1>
            <p className="opacity-70 text-foreground max-w-md text-sm leading-relaxed">
              Consistency is key. Track your practice progress, build your streak, and improve your ranking across multiple coding platforms.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 nm-inset rounded-2xl p-6 flex flex-col items-center justify-center">
          <DailyStreak />
        </div>
      </div>

      {/* Middle Row: Heatmap & Platforms */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 nm-flat rounded-2xl p-6">
          <ActivityHeatmap />
        </div>
        <div className="xl:col-span-1 rounded-2xl p-0 h-full">
          <PlatformsDashboard
            codeforcesUser={codeforcesUser}
            codeforcesContests={codeforcesContests}
            githubUsername={githubUsername}
            leetcodeUser={leetcodeUser}
          />
        </div>
      </div>

      {/* Bottom Row: Learning Hubs / Study Plans */}
      <div className="pt-4">
        <h2 className="text-xl font-bold mb-6 flex items-center text-(--heading-color)">
          <span className="text-orange-500 mr-3">
            <BookOpen className="w-5 h-5" />
          </span>
          Study Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dsa" className="block group">
            <div className="h-full nm-button rounded-2xl p-6 transition-all duration-300 flex items-start gap-4 hover:scale-[1.01]">
              <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-(--heading-color) group-hover:text-orange-500 transition-colors">
                  Data Structures & Algorithms
                </h3>
                <p className="opacity-70 text-sm leading-relaxed text-foreground">
                  Master the core concepts of computer science with curated
                  problems, subtopics, and dynamic pseudocode snippets.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/system-design" className="block group">
            <div className="h-full nm-button rounded-2xl p-6 transition-all duration-300 flex items-start gap-4 hover:scale-[1.01]">
              <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-(--heading-color) group-hover:text-orange-500 transition-colors">
                  System Design
                </h3>
                <p className="opacity-70 text-sm leading-relaxed text-foreground">
                  Design distributed systems on an interactive canvas and
                  validate architecture connectivity.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
