export interface LeetCodeUser {
  username: string;
  ranking: number;
  reputation: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
}

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

interface GQLDifficultyCount {
  difficulty: string;
  count: number;
}

interface GQLUserProfileResponse {
  data: {
    matchedUser: {
      username: string;
      profile: {
        ranking: number;
        reputation: number;
      };
      submitStatsGlobal: {
        acSubmissionNum: GQLDifficultyCount[];
      };
    } | null;
    allQuestionsCount: GQLDifficultyCount[];
  };
}

function extractCount(
  items: GQLDifficultyCount[],
  difficulty: string,
): number {
  return items.find((i) => i.difficulty === difficulty)?.count ?? 0;
}

const RECENT_SUBMISSIONS_QUERY = `
  query getRecentSubmissions($username: String!, $limit: Int) {
    recentSubmissionList(username: $username, limit: $limit) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

interface GQLRecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

interface GQLRecentSubmissionsResponse {
  data: {
    recentSubmissionList: GQLRecentSubmission[] | null;
  };
}

/**
 * Fetch the set of problem slugs that a LeetCode user has solved.
 * Uses `recentSubmissionList` to get all submissions, then checks
 * if the LATEST submission for each problem is "Accepted".
 */
export async function getLeetCodeSolvedSlugs(
  username: string,
): Promise<Set<string>> {
  try {
    const res = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: RECENT_SUBMISSIONS_QUERY,
        variables: { username, limit: 5000 },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("LeetCode API returned non-OK status:", res.status);
      return new Set();
    }

    const json: GQLRecentSubmissionsResponse = await res.json();
    const submissions = json.data?.recentSubmissionList;
    if (!submissions) {
      console.error("LeetCode API returned no submissions data", json);
      return new Set();
    }

    console.log(`[LeetCode Sync] Fetched ${submissions.length} submissions for user: ${username}`);

    // Build a map of slug → latest submission (submissions come sorted by recency)
    const latestBySlug = new Map<string, GQLRecentSubmission>();
    for (const sub of submissions) {
      const slug = sub.titleSlug.toLowerCase();
      if (!latestBySlug.has(slug)) {
        latestBySlug.set(slug, sub);
      }
    }

    // Only include slugs where the latest submission is Accepted
    const solvedSlugs = new Set<string>();
    for (const [slug, sub] of latestBySlug) {
      if (sub.statusDisplay === "Accepted") {
        solvedSlugs.add(slug);
      }
    }

    console.log(`[LeetCode Sync] ${latestBySlug.size} unique problems, ${solvedSlugs.size} solved (latest attempt accepted)`);
    return solvedSlugs;
  } catch (error) {
    console.error("LeetCode solved-slugs fetch error:", error);
    return new Set();
  }
}


export async function getLeetCodeUserProfile(
  username: string,
): Promise<LeetCodeUser | null> {
  try {
    const res = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: USER_PROFILE_QUERY,
        variables: { username },
      }),
      next: { revalidate: 300 }, // cache for 5 min
    });

    if (!res.ok) return null;

    const json: GQLUserProfileResponse = await res.json();
    const matched = json.data?.matchedUser;
    if (!matched) return null;

    const acStats = matched.submitStatsGlobal.acSubmissionNum;
    const allQ = json.data.allQuestionsCount;

    return {
      username: matched.username,
      ranking: matched.profile.ranking,
      reputation: matched.profile.reputation,
      totalSolved: extractCount(acStats, "All"),
      easySolved: extractCount(acStats, "Easy"),
      mediumSolved: extractCount(acStats, "Medium"),
      hardSolved: extractCount(acStats, "Hard"),
      totalQuestions: extractCount(allQ, "All"),
      easyTotal: extractCount(allQ, "Easy"),
      mediumTotal: extractCount(allQ, "Medium"),
      hardTotal: extractCount(allQ, "Hard"),
    };
  } catch (error) {
    console.error("LeetCode GraphQL API Error:", error);
    return null;
  }
}
