import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

type DsaProblemRow = {
  id: string;
  created_at: string;
  title: string;
  link: string | null;
  difficulty: number | null;
  platform: string | null;
  companies: unknown;
  tags: unknown;
  hints: unknown;
  solution: string | null;
  type: string | null;
  subtype: string | null;
};

export type DsaProblem = {
  id: string;
  createdAt: string;
  title: string;
  link: string;
  difficulty: number | null;
  platform: string;
  companies: string[];
  tags: string[];
  hints: string[];
  solution: string;
  type: string;
  subtype: string;
};

export type DsaSubtopicGroup = {
  id: string;
  title: string;
  problems: DsaProblem[];
};

export type DsaTopicGroup = {
  id: string;
  slug: string;
  title: string;
  description: string;
  subtopics: DsaSubtopicGroup[];
  totalProblems: number;
  problemIds: string[];
};

export function toTopicSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function humanizeSlug(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (typeof item === 'number') {
          return String(item);
        }

        if (item && typeof item === 'object') {
          const candidate = (item as { name?: unknown; value?: unknown }).name ?? (item as { value?: unknown }).value;
          if (typeof candidate === 'string') {
            return candidate.trim();
          }
        }

        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
}

function normalizeProblem(row: DsaProblemRow): DsaProblem {
  const type = (row.type ?? 'misc').trim().toLowerCase();
  const subtype = (row.subtype ?? 'general').trim().toLowerCase();

  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    link: row.link ?? '#',
    difficulty: row.difficulty,
    platform: row.platform ?? 'Unknown',
    companies: toStringArray(row.companies),
    tags: toStringArray(row.tags),
    hints: toStringArray(row.hints),
    solution: row.solution ?? '',
    type,
    subtype,
  };
}

export async function fetchDsaProblems(): Promise<DsaProblem[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('[DSA] Fetch context', {
    hasUser: !!user,
    userId: user?.id ?? null,
    userError: userError?.message ?? null,
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceRoleKey: !!supabaseServiceRoleKey,
  });

  const { data, error } = await supabase
    .schema('public')
    .from('dsa_problems')
    .select('id, created_at, title, link, difficulty, platform, companies, tags, hints, solution, type, subtype')
    .order('type', { ascending: true })
    .order('subtype', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[DSA] Supabase fetch error from dsa_problems', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Failed to load DSA problems: ${error.message}`);
  }

  let rows = (data ?? []) as DsaProblemRow[];

  if (rows.length === 0 && supabaseUrl && supabaseServiceRoleKey) {
    console.warn('[DSA] Primary read returned 0 rows. Trying service-role fallback to detect RLS/access issues.');

    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: adminData, error: adminError } = await adminSupabase
      .schema('public')
      .from('dsa_problems')
      .select('id, created_at, title, link, difficulty, platform, companies, tags, hints, solution, type, subtype')
      .order('type', { ascending: true })
      .order('subtype', { ascending: true })
      .order('created_at', { ascending: true });

    if (adminError) {
      console.error('[DSA] Service-role fallback query failed', {
        message: adminError.message,
        code: adminError.code,
        details: adminError.details,
        hint: adminError.hint,
      });
    } else {
      rows = (adminData ?? []) as DsaProblemRow[];
      console.warn('[DSA] Service-role fallback succeeded', {
        fallbackRowCount: rows.length,
      });
    }
  }

  console.log('[DSA] Raw rows from dsa_problems', {
    count: rows.length,
    rows,
  });

  const normalized = rows.map(normalizeProblem);
  console.log('[DSA] Normalized DSA problems', {
    count: normalized.length,
    sample: normalized.slice(0, 5),
  });
  return normalized;
}

export async function fetchDsaTopicGroups(): Promise<DsaTopicGroup[]> {
  const problems = await fetchDsaProblems();
  const grouped = new Map<string, Map<string, DsaProblem[]>>();

  problems.forEach((problem) => {
    if (!grouped.has(problem.type)) {
      grouped.set(problem.type, new Map<string, DsaProblem[]>());
    }

    const subtopics = grouped.get(problem.type)!;
    if (!subtopics.has(problem.subtype)) {
      subtopics.set(problem.subtype, []);
    }

    subtopics.get(problem.subtype)!.push(problem);
  });

  const topics = Array.from(grouped.entries()).map(([topicId, subtopicMap]) => {
    const subtopics = Array.from(subtopicMap.entries()).map(([subtopicId, subtopicProblems]) => ({
      id: subtopicId,
      title: humanizeSlug(subtopicId),
      problems: subtopicProblems,
    }));

    const problemIds = subtopics.flatMap((subtopic) => subtopic.problems.map((problem) => problem.id));
    const totalProblems = problemIds.length;

    return {
      id: topicId,
      slug: toTopicSlug(topicId),
      title: humanizeSlug(topicId),
      description: `${totalProblems} curated problems across ${subtopics.length} subtopic${subtopics.length === 1 ? '' : 's'}.`,
      subtopics,
      totalProblems,
      problemIds,
    };
  });

  console.log('[DSA] Grouped topic output', {
    topicCount: topics.length,
    topics: topics.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      totalProblems: topic.totalProblems,
      subtopics: topic.subtopics.map((subtopic) => ({
        id: subtopic.id,
        problemCount: subtopic.problems.length,
      })),
    })),
  });

  return topics;
}