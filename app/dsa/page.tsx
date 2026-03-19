import Link from 'next/link';
import { dsaTopics } from '@/lib/data';
import { ArrowLeft, BookMarked } from 'lucide-react';
import TopicProgressCard from '@/components/TopicProgressCard';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-12">
        {Object.values(dsaTopics).map((topic) => (
          <TopicProgressCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
