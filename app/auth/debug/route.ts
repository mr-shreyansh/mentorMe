import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function isAuthorized(request: NextRequest) {
  const debugToken = process.env.AUTH_DEBUG_TOKEN;

  if (!debugToken) {
    return process.env.NODE_ENV !== "production";
  }

  const provided = request.headers.get("x-auth-debug-token") ?? request.nextUrl.searchParams.get("token");
  return provided === debugToken;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized debug access" }, { status: 401 });
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const allCookies = request.cookies.getAll();
  const supabaseCookieNames = allCookies
    .map((cookie) => cookie.name)
    .filter((name) => name.includes("sb-") || name.includes("supabase"));

  const debugPayload = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    request: {
      url: request.url,
      origin: request.nextUrl.origin,
      host: request.headers.get("host"),
      xForwardedHost: request.headers.get("x-forwarded-host"),
      xForwardedProto: request.headers.get("x-forwarded-proto"),
      userAgent: request.headers.get("user-agent"),
    },
    cookies: {
      totalCount: allCookies.length,
      names: allCookies.map((cookie) => cookie.name),
      hasSupabaseCookies: supabaseCookieNames.length > 0,
      supabaseCookieNames,
    },
    supabase: {
      hasUser: !!user,
      userId: user?.id ?? null,
      email: user?.email ?? null,
      authError: error
        ? {
            message: error.message,
            status: error.status,
            code: error.code,
          }
        : null,
    },
    hint: "If callback has code but hasUser=false, compare request origin/host with login-start domain and Supabase redirect allow list.",
  };

  return NextResponse.json(debugPayload, {
    status: 200,
    headers: response.headers,
  });
}