import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { toAppUrl } from "@/lib/url";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSafeNextPath(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith("/")) {
    return "/";
  }

  return nextParam;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(toAppUrl("/?authError=missing_code", request));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(toAppUrl("/?authError=oauth_callback_failed", request));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const githubMetadata = user.user_metadata as {
      provider_id?: string | number;
      user_name?: string;
      preferred_username?: string;
      full_name?: string;
      avatar_url?: string;
      email?: string;
    };

    const rawGithubId = githubMetadata.provider_id;
    const githubId = Number.parseInt(String(rawGithubId ?? ""), 10);

    if (Number.isNaN(githubId)) {
      console.error("Failed to provision user row: missing GitHub numeric id", {
        userId: user.id,
      });
    } else {
      const { error: provisionError } = await supabase.rpc("provision_user_profile", {
        p_auth_user_id: user.id,
        p_github_id: githubId,
        p_email: user.email ?? githubMetadata.email ?? null,
        p_full_name: githubMetadata.full_name ?? null,
        p_avatar_url: githubMetadata.avatar_url ?? null,
        p_username: githubMetadata.user_name ?? githubMetadata.preferred_username ?? null,
      });

      if (provisionError) {
        if (provisionError.code === "PGRST202" && supabaseServiceRoleKey) {
          const adminSupabase = createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey);
          const { error: fallbackError } = await adminSupabase
            .from("users")
            .upsert(
              {
                id: githubId,
                created_at: new Date().toISOString(),
                email: user.email ?? githubMetadata.email ?? null,
                full_name: githubMetadata.full_name ?? null,
                avatar_url: githubMetadata.avatar_url ?? null,
                username: githubMetadata.user_name ?? githubMetadata.preferred_username ?? null,
              },
              { onConflict: "id", ignoreDuplicates: true },
            );

          if (fallbackError) {
            console.error("Failed to provision user row via fallback", fallbackError);
          } else {
            console.warn("Provision RPC missing in schema cache; fallback upsert succeeded");
          }
        } else {
          console.error("Failed to provision user row", provisionError);
        }
      }
    }
  }

  const redirectResponse = NextResponse.redirect(toAppUrl(nextPath, request));

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return redirectResponse;
}
