"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { getCodeforcesUserInfo } from "@/lib/codeforces";
import { revalidatePath } from "next/cache";

export async function connectCodeforcesHandle(handle: string) {
  try {
    const handleRegex = /^[a-zA-Z0-9_-]{3,24}$/;
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

    const cfUser = await getCodeforcesUserInfo(handle);
    if (!cfUser) {
      return {
        success: false,
        error: "Could not find Codeforces user with that handle.",
      };
    }
    
    const rawGithubId = user.user_metadata?.provider_id;
    const githubId = Number.parseInt(String(rawGithubId ?? ""), 10);
    
    if (Number.isNaN(githubId)) {
      return {
        success: false,
        error: "Could not identify user's database ID.",
      };
    }
    
    console.log("cfUser", cfUser, user.id);
    const { error: updateError } = await supabase
      .from("users")
      .update({ codeforces_handle: cfUser.handle })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update user codeforces handle:", updateError);
      return { success: false, error: "Failed to save handle to database." };
    }

    revalidatePath("/");

    return { success: true, handle: cfUser.handle };
  } catch (err: any) {
    console.error("Error in connectCodeforcesHandle action:", err);
    return {
      success: false,
      error: "Ensure your handle is correct and try again.",
    };
  }
}
