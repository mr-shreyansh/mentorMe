"use client";

import { useState } from "react";
import { Github, X } from "lucide-react";

type LoginButtonProps = {
  returnTo?: string;
  isLoggedIn?: boolean;
  userLabel?: string;
};

export default function LoginButton({
  returnTo = "/",
  isLoggedIn = false,
  userLabel,
}: LoginButtonProps) {
  const [open, setOpen] = useState(false);

  if (isLoggedIn) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full px-4 py-2 nm-flat-sm text-sm text-(--heading-color)">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span>Signed in{userLabel ? ` as ${userLabel}` : ""}</span>
        <form method="post" action={`/auth/logout?next=${encodeURIComponent(returnTo)}`}>
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 nm-button text-xs font-semibold"
          >
            Logout
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 nm-button text-sm font-semibold text-(--heading-color)"
      >
        Login
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close login popup"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-lg p-6 md:p-8 nm-flat">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 nm-button text-(--heading-color)"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-2xl font-bold text-(--heading-color)">Continue To ProTrainer</h2>
            <p className="mt-2 text-sm opacity-70">
              Sign in securely with GitHub. Google auth can be added later without changing this flow.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={`/auth/login?provider=github&next=${encodeURIComponent(returnTo)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 nm-button font-semibold text-(--heading-color)"
              >
                <Github className="h-5 w-5" />
                Continue with GitHub
              </a>

              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg px-4 py-3 nm-flat-sm opacity-60"
              >
                Google (coming soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
