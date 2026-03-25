import SystemDesignCanvas from '@/components/system-design/SystemDesignCanvas';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function SystemDesignPage() {
  return (
    <div className="space-y-8">
      <header className="nm-flat rounded-lg p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-(--heading-color)">
          System Design Studio
        </h1>
        <p className="text-sm md:text-base opacity-75 mt-3 max-w-3xl">
          Build architecture diagrams with reusable nodes and dynamic handles. Submit the graph for validation
          to detect missing links or incorrect connections.
        </p>
      </header>

      {/* Blog link card */}
      <Link href="/system-design/blogs" className="block group">
        <div className="nm-button rounded-lg p-8 transition-all duration-300 flex items-center gap-6">
          <div className="nm-inset-sm w-14 h-14 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-(--heading-color) group-hover:text-orange-500 transition-colors mb-1">
              System Design Blogs
            </h2>
            <p className="opacity-70 text-sm leading-relaxed">
              Deep-dive articles on real-world system design problems with interactive quizzes after each section.
            </p>
          </div>
          <span className="text-orange-500 font-semibold text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            Explore →
          </span>
        </div>
      </Link>

      <SystemDesignCanvas />
    </div>
  );
}
