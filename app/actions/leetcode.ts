"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { getLeetCodeUserProfile } from "@/lib/leetcode";
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
