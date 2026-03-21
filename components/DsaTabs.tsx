"use client";

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import ProblemCheckbox from '@/components/ProblemCheckbox';
import type { DsaTopicGroup } from '@/lib/dsa';

type DsaTabsProps = {
  topics: DsaTopicGroup[];
};

export default function DsaTabs({ topics }: DsaTabsProps) {
  const [activeTopicId, setActiveTopicId] = useState<string>(topics[0]?.id ?? '');
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? topics[0];

  if (!activeTopic) {
    return (
      <div className="nm-flat rounded-[3rem] p-8 text-center">
        <p className="opacity-70">No DSA problems found in the database yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="nm-flat rounded-[2.5rem] p-4 md:p-5">
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveTopicId(topic.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                activeTopic.id === topic.id
                  ? 'nm-flat text-orange-500'
                  : 'nm-inset-sm text-foreground opacity-70 hover:opacity-100'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      <section className="nm-flat rounded-[3rem] p-8 md:p-12">
        <h2 className="text-2xl font-bold text-(--heading-color) mb-3">{activeTopic.title}</h2>
        <p className="opacity-70 mb-10">{activeTopic.description}</p>

        <div className="space-y-14">
          {activeTopic.subtopics.map((subtopic) => (
            <div key={subtopic.id}>
              <h3 className="text-xl font-bold text-(--heading-color) mb-6 flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-500" />
                {subtopic.title}
              </h3>

              {subtopic.problems.length > 0 ? (
                <div className="space-y-2">
                  {subtopic.problems.map((problem) => (
                    <ProblemCheckbox
                      key={problem.id}
                      id={problem.id}
                      title={problem.title}
                      url={problem.link}
                      difficulty={problem.difficulty}
                      platform={problem.platform}
                      tags={problem.tags}
                      companies={problem.companies}
                      hints={problem.hints}
                      solution={problem.solution}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex-1 rounded-4xl nm-inset p-10 flex flex-col items-center justify-center text-center">
                  <p className="opacity-80 font-bold text-(--heading-color)">No examples added yet.</p>
                  <p className="opacity-50 text-sm mt-2 max-w-xs">Problems will appear here when this subtype has data.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}