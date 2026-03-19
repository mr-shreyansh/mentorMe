import Link from 'next/link';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { BookOpen, Code2, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="p-8 md:p-12 nm-flat rounded-[3rem]">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--heading-color)] mb-4">
          Welcome back, Developer
        </h1>
        <p className="opacity-70 text-lg max-w-2xl">Consistency is key. Here is your recent practice overview and your accessible learning hubs.</p>
      </header>

      <section>
        <ActivityHeatmap />
      </section>

      <section className="pt-4">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-[var(--heading-color)]">
          <span className="nm-flat-sm text-orange-500 p-3 rounded-2xl mr-5">
            <BookOpen className="w-6 h-6" />
          </span>
          Learning Hubs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/dsa" className="block group">
            <div className="h-full nm-button rounded-[2rem] p-8 transition-all duration-300">
              <div className="nm-inset-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                <Code2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--heading-color)]">Data Structures & Algorithms</h3>
              <p className="opacity-70 text-sm leading-relaxed">Master the core concepts of computer science with curated problems, subtopics, and dynamic pseudocode snippets.</p>
            </div>
          </Link>

          <div className="h-full nm-flat rounded-[2rem] p-8 opacity-60 cursor-not-allowed">
            <div className="nm-inset w-16 h-16 rounded-2xl flex items-center justify-center mb-6 opacity-60">
              <Terminal className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-[var(--heading-color)]">System Design</h3>
            <p className="opacity-70 text-sm leading-relaxed">Coming soon. Learn how to architect scalable and reliable distributed systems from the ground up.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
