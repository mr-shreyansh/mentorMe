"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { getLeetCodeUserProfile, getLeetCodeSolvedSlugs } from "@/lib/leetcode";
import { revalidatePath } from "next/cache";

export async function connectLeetcodeHandle(handle: string) {
  try {
    const handleRegex = /^[a-zA-Z0-9_-]{1,30}$/;
    if (!handleRegex.test(handle)) {
      return { success: false, error: "Invalid handle format." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const lcUser = await getLeetCodeUserProfile(handle);
    if (!lcUser) {
      return {
        success: false,
        error: "Could not find LeetCode user with that handle.",
      };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ leetcode_handle: lcUser.username })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update user leetcode handle:", updateError);
      return { success: false, error: "Failed to save handle to database." };
    }

    revalidatePath("/");

    return { success: true, handle: lcUser.username };
  } catch (err: any) {
    console.error("Error in connectLeetcodeHandle action:", err);
    return {
      success: false,
      error: "Ensure your handle is correct and try again.",
    };
  }
}

/**
 * Extract a LeetCode problem slug from a URL.
 * e.g. "https://leetcode.com/problems/two-sum/" → "two-sum"
 */
function extractSlugFromUrl(url: string): string | null {
  try {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function syncLeetcodeProblems() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Get the user's LeetCode handle
    const { data: userData } = await supabase
      .from("users")
      .select("leetcode_handle")
      .eq("id", user.id)
      .single();

    if (!userData?.leetcode_handle) {
      return {
        success: false,
        error: "No LeetCode handle connected. Please connect your handle first.",
      };
    }

    // 2. Fetch all dsa_problems with LeetCode links
    const { data: problems, error: problemsError } = await supabase
      .from("dsa_problems")
      .select("id, link")
      .not("link", "is", null);

    if (problemsError) {
      console.error("Failed to fetch dsa_problems:", problemsError);
      return { success: false, error: "Failed to fetch problems." };
    }

    // 3. Filter to only LeetCode problems and extract slugs
    const leetcodeProblems = (problems ?? [])
      .map((p) => ({
        id: p.id as string,
        link: p.link as string,
        slug: extractSlugFromUrl(p.link as string),
      }))
      .filter((p): p is { id: string; link: string; slug: string } => p.slug !== null);

    console.log("[LeetCode Sync] LeetCode problems from DB:", leetcodeProblems.map(p => ({ slug: p.slug, link: p.link })));

    if (leetcodeProblems.length === 0) {
      return { success: true, synced: 0, solved: 0, message: "No LeetCode problems found to sync." };
    }

    // 4. Fetch solved slugs from LeetCode
    const solvedSlugs = await getLeetCodeSolvedSlugs(userData.leetcode_handle);

    console.log("[LeetCode Sync] Solved slugs from LeetCode API:", [...solvedSlugs].slice(0, 20), `... (${solvedSlugs.size} total)`);

    if (solvedSlugs.size === 0) {
      return {
        success: true,
        synced: leetcodeProblems.length,
        solved: 0,
        message: "Could not fetch solved problems from LeetCode, or no problems solved yet.",
      };
    }

    // 5. Upsert into user_problem_map
    const now = new Date().toISOString();
    let solvedCount = 0;

    const upsertRows = leetcodeProblems.map((p) => {
      const isSolved = solvedSlugs.has(p.slug);
      if (isSolved) {
        solvedCount++;
        console.log(`[LeetCode Sync] ✅ SOLVED: ${p.slug}`);
      } else {
        console.log(`[LeetCode Sync] ❌ NOT SOLVED: ${p.slug}`);
      }
      return {
        user_id: user.id,
        problem_id: p.id,
        is_solved: isSolved,
        solved_at: isSolved ? now : null,
      };
    });

    const { error: upsertError } = await supabase
      .from("user_problem_map")
      .upsert(upsertRows, { onConflict: "user_id,problem_id" });

    if (upsertError) {
      console.error("Failed to upsert user_problem_map:", upsertError);
      return { success: false, error: "Failed to save sync results." };
    }

    revalidatePath("/dsa");

    return {
      success: true,
      synced: leetcodeProblems.length,
      solved: solvedCount,
      message: `Synced ${leetcodeProblems.length} problems. ${solvedCount} marked as solved.`,
    };
  } catch (err: any) {
    console.error("Error in syncLeetcodeProblems:", err);
    return {
      success: false,
      error: "An unexpected error occurred during sync.",
    };
  }
}
