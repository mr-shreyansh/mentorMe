import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function getSafeNextPath(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith("/")) {
    return "/";
  }

  return nextParam;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get("provider") ?? "github";
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (provider !== "github") {
    return NextResponse.redirect(new URL("/?authError=unsupported_provider", request.url));
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/?authError=oauth_start_failed", request.url));
  }

  const redirectResponse = NextResponse.redirect(data.url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return redirectResponse;
}
