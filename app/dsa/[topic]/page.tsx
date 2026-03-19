import { notFound } from 'next/navigation';
import { dsaTopics } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Code } from 'lucide-react';
import ProblemCheckbox from '@/components/ProblemCheckbox';
import CodeSnippet from '@/components/CodeSnippet';

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const topicData = dsaTopics[topic];

  if (!topicData) {
    notFound();
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="mb-10">
         <Link href="/dsa" className="inline-flex items-center text-[var(--text-color)] opacity-70 hover:opacity-100 transition-opacity mb-8 text-sm font-medium nm-button py-3 px-6 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Topics
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--heading-color)] mb-4">
          {topicData.title}
        </h1>
        <p className="opacity-70 text-lg max-w-3xl">{topicData.description}</p>
      </div>

      <div className="space-y-16">
        {topicData.subtopics.map((subtopic) => (
          <section key={subtopic.id} className="nm-flat rounded-[3rem] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[var(--heading-color)] mb-10 flex items-center">
              <span className="w-3 h-10 nm-inset rounded-full mr-5 inline-block"></span>
              {subtopic.title}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Examples */}
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-[var(--heading-color)] mb-6 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-500" />
                  Practice Scenarios
                </h3>
                {subtopic.examples.length > 0 ? (
                  <div className="space-y-2">
                    {subtopic.examples.map(ex => (
                      <ProblemCheckbox key={ex.id} id={ex.id} title={ex.title} url={ex.url} />
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 rounded-[2rem] nm-inset p-10 flex flex-col items-center justify-center text-center">
                    <p className="opacity-80 font-bold text-[var(--heading-color)]">No examples added yet.</p>
                    <p className="opacity-50 text-sm mt-2 max-w-xs">You can add coding problem links here and check them off as you complete them.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Pseudocode */}
              <div>
                <h3 className="text-xl font-bold text-[var(--heading-color)] mb-6 flex items-center">
                  <Code className="w-6 h-6 mr-3 text-orange-500" />
                  Pseudocode Implementation
                </h3>
                <CodeSnippet code={subtopic.pseudocode} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(dsaTopics).map(topic => ({ topic }));
}
