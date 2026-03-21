import Link from 'next/link';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import DailyStreak from '@/components/DailyStreak';
import PlatformsDashboard from '@/components/PlatformsDashboard';
import { BookOpen, Code2, Terminal } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import LoginButton from '@/components/auth/LoginButton';

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();


  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <section className="flex justify-start">
        <LoginButton
          returnTo="/"
          isLoggedIn={!!user}
          userLabel={(user?.user_metadata?.user_name as string | undefined) ?? user?.email ?? undefined}
        />
      </section>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <header className="flex-1 p-8 md:p-12 nm-flat rounded-5xl w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-(--heading-color) mb-4">
            Welcome back, Developer
          </h1>
          <p className="opacity-70 text-lg max-w-2xl text-foreground">Consistency is key. Here is your recent practice overview and your platforms hubs.</p>
        </header>
        <div className="w-full lg:w-auto shrink-0 self-center lg:self-start">
          <DailyStreak />
        </div>
      </div>

      <section>
        <ActivityHeatmap />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 pt-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center text-(--heading-color)">
            <span className="nm-flat-sm text-orange-500 p-3 rounded-2xl mr-5">
              <BookOpen className="w-6 h-6" />
            </span>
            Learning Hubs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/dsa" className="block group">
              <div className="h-full nm-button rounded-4xl p-8 transition-all duration-300">
                <div className="nm-inset-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                  <Code2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-(--heading-color)">Data Structures & Algorithms</h3>
                <p className="opacity-70 text-sm leading-relaxed text-foreground">Master the core concepts of computer science with curated problems, subtopics, and dynamic pseudocode snippets.</p>
              </div>
            </Link>

            <Link href="/system-design" className="block group">
              <div className="h-full nm-button rounded-4xl p-8 transition-all duration-300">
                <div className="nm-inset w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                  <Terminal className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-(--heading-color)">System Design</h3>
                <p className="opacity-70 text-sm leading-relaxed text-foreground">Design distributed systems on an interactive canvas and validate architecture connectivity.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="pt-4">
            <PlatformsDashboard />
        </section>
      </div>
    </div>
  );
}
