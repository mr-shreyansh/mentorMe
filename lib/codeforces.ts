export interface CodeforcesUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

export async function getCodeforcesUserInfo(handle: string): Promise<CodeforcesUser | null> {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await res.json();
    if (data.status === 'OK' && data.result.length > 0) {
      return data.result[0];
    }
    return null;
  } catch (error) {
    console.error("Codeforces API Error:", error);
    return null;
  }
}

export async function getUpcomingCodeforcesContests(): Promise<CodeforcesContest[]> {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const data = await res.json();
    if (data.status === 'OK') {
      // Filter contests that are BEFORE start phase
      const upcoming = data.result.filter((c: CodeforcesContest) => c.phase === 'BEFORE');
      // Sort by start time ascending
      upcoming.sort((a: CodeforcesContest, b: CodeforcesContest) => a.startTimeSeconds - b.startTimeSeconds);
      // Return top 2 or 3 upcoming contests
      return upcoming.slice(0, 2);
    }
    return [];
  } catch (error) {
    console.error("Codeforces API Error:", error);
    return [];
  }
}
