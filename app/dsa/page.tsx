import Link from 'next/link';
import { fetchDsaTopicGroups } from '@/lib/dsa';
import { ArrowLeft, BookMarked } from 'lucide-react';
import DsaTabs from '@/components/DsaTabs';

export default async function DSAPage() {
  const topics = await fetchDsaTopicGroups();

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-foreground opacity-70 hover:opacity-100 transition-opacity mb-8 text-sm font-medium nm-button py-3 px-6 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-(--heading-color) mb-4 flex items-center">
          <span className="nm-inset-sm text-orange-500 p-4 rounded-4xl mr-5">
            <BookMarked className="w-8 h-8" />
          </span>
          DSA Practice
        </h1>
        <p className="opacity-70 text-lg max-w-2xl">Use tabs to switch topics, then explore problems grouped by subtype.</p>
      </div>

      <DsaTabs topics={topics} />
    </div>
  );
}
