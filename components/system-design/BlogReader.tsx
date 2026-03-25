'use client';

import { useState, useRef, useCallback } from 'react';
import type { Blog, Section, Question, Option } from '@/lib/system-design';
import { CheckCircle, XCircle, ChevronDown, Lightbulb, BookOpen, Award } from 'lucide-react';

interface BlogReaderProps {
  blog: Blog;
  sections: Section[];
}

// Render markdown-ish content — the seed data uses bold, code, lists, newlines
function SectionContent({ html }: { html: string }) {
  // Convert markdown-style formatting to HTML
  const rendered = html
    // Code blocks (triple backtick)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="blog-code-block"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="blog-inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    // Numbered list items (lines starting with digits)
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="blog-list-item" value="$1">$2</li>')
    // Unordered list items
    .replace(/^[-•]\s+(.+)$/gm, '<li class="blog-list-item-ul">$1</li>')
    // Wrap consecutive <li> in <ol> / <ul>
    .replace(
      /((?:<li class="blog-list-item"[^>]*>.*?<\/li>\n?)+)/g,
      '<ol class="blog-ol">$1</ol>'
    )
    .replace(
      /((?:<li class="blog-list-item-ul">.*?<\/li>\n?)+)/g,
      '<ul class="blog-ul">$1</ul>'
    )
    // Line breaks (double newline → paragraph break)
    .replace(/\n\n/g, '</p><p class="blog-para">')
    // Single newlines (within content) → <br>
    .replace(/\n/g, '<br/>');

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: `<p class="blog-para">${rendered}</p>` }}
    />
  );
}

function QuizOption({
  option,
  selected,
  answered,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  answered: boolean;
  onSelect: () => void;
}) {
  let stateClass = '';
  if (answered) {
    if (option.is_correct) {
      stateClass = 'quiz-option-correct';
    } else if (selected) {
      stateClass = 'quiz-option-incorrect';
    } else {
      stateClass = 'quiz-option-disabled';
    }
  }

  return (
    <button
      type="button"
      disabled={answered}
      onClick={onSelect}
      className={`quiz-option nm-button rounded-lg p-4 text-left w-full transition-all duration-300 ${stateClass}`}
    >
      <div className="flex items-start gap-3">
        <span className="nm-inset-sm rounded-md w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 quiz-option-label">
          {option.option_label}
        </span>
        <span className="text-sm leading-relaxed flex-1 pt-1">{option.option_text}</span>
        {answered && option.is_correct && (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        )}
        {answered && selected && !option.is_correct && (
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
}

function QuizCard({ question, index }: { question: Question; index: number }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (answered) return;
      setSelectedOption(optionId);
      setAnswered(true);
      // Delay showing explanation for drama
      setTimeout(() => setShowExplanation(true), 400);
    },
    [answered]
  );

  const isCorrect =
    answered &&
    question.options.find((o) => o.id === selectedOption)?.is_correct;

  return (
    <div className="quiz-card nm-flat rounded-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="nm-inset-sm text-orange-500 p-2 rounded-lg">
          <Lightbulb className="w-4 h-4" />
        </span>
        <h4 className="text-xs font-bold tracking-widest uppercase opacity-50">
          Question {index + 1}
        </h4>
      </div>

      <p className="text-base font-medium text-(--heading-color) mb-6 leading-relaxed">
        {question.question_text}
      </p>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <QuizOption
            key={opt.id}
            option={opt}
            selected={selectedOption === opt.id}
            answered={answered}
            onSelect={() => handleSelect(opt.id)}
          />
        ))}
      </div>

      {/* Result feedback */}
      {answered && (
        <div
          className={`mt-5 flex items-center gap-2 text-sm font-semibold ${
            isCorrect ? 'text-emerald-500' : 'text-red-500'
          } animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          {isCorrect ? (
            <>
              <Award className="w-4 h-4" /> Correct!
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" /> Not quite — see the explanation below.
            </>
          )}
        </div>
      )}

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className="mt-4 nm-inset-sm rounded-lg p-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <ChevronDown className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-orange-500">
              Explanation
            </span>
          </div>
          <p className="text-sm leading-relaxed opacity-80">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default function BlogReader({ blog, sections }: BlogReaderProps) {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const scrollToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current.get(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  const diffColors: Record<string, string> = {
    easy: 'text-emerald-500',
    medium: 'text-amber-500',
    hard: 'text-red-500',
  };

  return (
    <div className="blog-reader">
      {/* Hero header */}
      <header className="nm-flat rounded-lg p-8 md:p-12 mb-8">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span
            className={`nm-inset-sm rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
              diffColors[blog.difficulty] ?? ''
            }`}
          >
            {blog.difficulty}
          </span>
          {blog.tags?.map((tag) => (
            <span key={tag} className="nm-inset-sm rounded-full px-3 py-1 text-xs opacity-60">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-(--heading-color) mb-4">
          {blog.title}
        </h1>
        <p className="opacity-70 text-lg max-w-3xl">{blog.description}</p>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-current/5 text-sm opacity-50">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> {sections.length} sections
          </span>
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" /> {totalQuestions} quiz questions
          </span>
        </div>
      </header>

      {/* Table of contents */}
      <nav className="nm-flat rounded-lg p-6 mb-8">
        <h3 className="text-sm font-bold tracking-widest uppercase text-(--heading-color) mb-4 opacity-60">
          Table of Contents
        </h3>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sections.map((section, i) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="nm-button rounded-lg px-4 py-3 text-sm text-left w-full hover:text-orange-500 transition-colors"
              >
                <span className="font-mono text-orange-500/60 mr-2">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                {section.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections + Quizzes */}
      <div className="space-y-10">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
            }}
            className="scroll-mt-6"
          >
            {/* Section content card */}
            <article className="nm-flat rounded-lg p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="nm-inset-sm text-orange-500 font-mono text-sm font-bold rounded-lg w-10 h-10 flex items-center justify-center">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-(--heading-color)">
                  {section.title}
                </h2>
              </div>

              {section.content && <SectionContent html={section.content} />}
            </article>

            {/* Quiz questions for this section */}
            {section.questions.length > 0 && (
              <div className="mt-6 space-y-6 pl-4 md:pl-8 border-l-2 border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-orange-500">
                    🧠 Test Your Understanding
                  </span>
                </div>
                {section.questions.map((question, qIndex) => (
                  <QuizCard key={question.id} question={question} index={qIndex} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
