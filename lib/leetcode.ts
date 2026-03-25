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
