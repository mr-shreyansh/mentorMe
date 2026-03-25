import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogBySlug, fetchSectionsWithQuiz } from '@/lib/system-design';
import BlogReader from '@/components/system-design/BlogReader';
import { ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const sections = await fetchSectionsWithQuiz(blog.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Navigation */}
      <div>
        <Link
          href="/system-design/blogs"
          className="inline-flex items-center text-foreground opacity-70 hover:opacity-100 transition-opacity text-sm font-medium nm-button py-3 px-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
        </Link>
      </div>

      <BlogReader blog={blog} sections={sections} />
    </div>
  );
}
