import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

// ── Types ────────────────────────────────────────────────────

export interface Blog {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface Option {
  id: string;
  option_label: string;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  order_index: number;
  question_text: string;
  explanation: string | null;
  options: Option[];
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  content: string | null;
  questions: Question[];
}

// ── Data fetching ────────────────────────────────────────────

export async function fetchBlogs(): Promise<Blog[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  return data ?? [];
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog:', error);
    return null;
  }

  return data;
}

export async function fetchSectionsWithQuiz(blogId: string): Promise<Section[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch sections for this blog, ordered correctly
  const { data: sections, error: secError } = await supabase
    .from('sections')
    .select('*')
    .eq('blog_id', blogId)
    .order('order_index', { ascending: true });

  if (secError || !sections) {
    console.error('Error fetching sections:', secError);
    return [];
  }

  // Fetch all questions with their options in one go
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select(`
      *,
      options (*)
    `)
    .order('order_index', { ascending: true });

  if (qError) {
    console.error('Error fetching questions:', qError);
  }

  // Group questions by section_id
  const questionsBySectionId = new Map<string, Question[]>();
  if (questions) {
    for (const q of questions) {
      const sectionQuestions = questionsBySectionId.get(q.section_id) ?? [];
      sectionQuestions.push({
        id: q.id,
        order_index: q.order_index,
        question_text: q.question_text,
        explanation: q.explanation,
        options: ((q.options as Option[]) ?? []).sort((a, b) =>
          a.option_label.localeCompare(b.option_label)
        ),
      });
      questionsBySectionId.set(q.section_id, sectionQuestions);
    }
  }

  return sections.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    order_index: s.order_index,
    content: s.content,
    questions: (questionsBySectionId.get(s.id) ?? []).sort(
      (a, b) => a.order_index - b.order_index
    ),
  }));
}
