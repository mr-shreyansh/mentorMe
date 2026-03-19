import Link from 'next/link';
import { dsaTopics } from '@/lib/data';
import { ArrowLeft, BookMarked } from 'lucide-react';

export default function DSAPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-[var(--text-color)] opacity-70 hover:opacity-100 transition-opacity mb-8 text-sm font-medium nm-button py-3 px-6 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--heading-color)] mb-4 flex items-center">
          <span className="nm-inset-sm text-orange-500 p-4 rounded-[2rem] mr-5">
            <BookMarked className="w-8 h-8" />
          </span>
          DSA Practice
        </h1>
        <p className="opacity-70 text-lg max-w-2xl">Select a core topic to begin diving deep into algorithms and structural concepts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {Object.values(dsaTopics).map((topic) => (
          <Link href={`/dsa/${topic.id}`} key={topic.id} className="block group">
            <div className="nm-flat hover:nm-button rounded-[2.5rem] p-8 transition-all duration-300 h-full flex flex-col group-hover:scale-[1.02]">
              <h3 className="text-2xl font-bold text-[var(--heading-color)] mb-3">{topic.title}</h3>
              <p className="opacity-70 text-sm flex-1 leading-relaxed">{topic.description}</p>
              <div className="mt-8 flex items-center text-sm font-bold text-orange-500 group-hover:text-orange-400">
                Start Practicing <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
