import Link from 'next/link';
import { fetchBlogs } from '@/lib/system-design';
import { ArrowLeft, BookOpen, Clock, Zap } from 'lucide-react';

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-500' },
  medium: { label: 'Medium', color: 'text-amber-500' },
  hard: { label: 'Hard', color: 'text-red-500' },
};

export default async function BlogsPage() {
  const blogs = await fetchBlogs();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Navigation */}
      <div className="mb-4">
        <Link
          href="/system-design"
          className="inline-flex items-center text-foreground opacity-70 hover:opacity-100 transition-opacity text-sm font-medium nm-button py-3 px-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to System Design
        </Link>
      </div>

      {/* Header */}
      <header className="nm-flat rounded-lg p-8 md:p-12">
        <div className="flex items-center gap-5 mb-4">
          <span className="nm-inset-sm text-orange-500 p-4 rounded-lg">
            <BookOpen className="w-8 h-8" />
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-(--heading-color)">
            System Design Blogs
          </h1>
        </div>
        <p className="opacity-70 text-lg max-w-2xl">
          Deep-dive articles on real-world system design problems. Read the explanation, then test
          your understanding with interactive quizzes after each section.
        </p>
      </header>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="nm-flat rounded-lg p-12 text-center">
          <p className="text-lg opacity-60">No blogs published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => {
            const diff = difficultyConfig[blog.difficulty] ?? {
              label: blog.difficulty,
              color: 'text-foreground',
            };

            return (
              <Link
                key={blog.id}
                href={`/system-design/blogs/${blog.slug}`}
                className="block group"
              >
                <article className="h-full nm-button rounded-lg p-8 transition-all duration-300 flex flex-col">
                  {/* Difficulty + Tags row */}
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <span
                      className={`nm-inset-sm rounded-full px-3 py-1 text-xs font-bold tracking-wide ${diff.color}`}
                    >
                      {diff.label}
                    </span>
                    {blog.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="nm-inset-sm rounded-full px-3 py-1 text-xs opacity-60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl font-bold text-(--heading-color) mb-3 group-hover:text-orange-500 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="opacity-70 text-sm leading-relaxed flex-1">
                    {blog.description}
                  </p>

                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-current/5">
                    <span className="inline-flex items-center gap-1.5 text-xs opacity-50">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-orange-500 font-semibold ml-auto">
                      <Zap className="w-3.5 h-3.5" />
                      Start Reading →
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
