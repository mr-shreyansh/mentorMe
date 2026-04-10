import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from '@/components/ProgressProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppSidebar from "@/components/AppSidebar";
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import LoginButton from "@/components/auth/LoginButton";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProTrainer - Coding Practice",
  description: "Track your practice progress",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster theme="system" position="top-right" richColors />
          <ProgressProvider>
            
            {/* Sidebar for Desktop */}
            <AppSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
              
              {/* Top Navigation / Mobile Header */}
              <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/50 bg-background z-30 sticky top-0">
                <div className="flex items-center gap-4 md:hidden">
                  <div className="font-extrabold text-xl tracking-wider text-[var(--heading-color)]">
                    Pro<span className="text-orange-500">Trainer</span>
                  </div>
                </div>
                {/* Spacer to push ThemeToggle and LoginButton to the right */}
                <div className="hidden md:block flex-1"></div>
                
                <div className="flex items-center gap-4">
                  <LoginButton
                    returnTo="/"
                    isLoggedIn={!!user}
                    userLabel={
                      (user?.user_metadata?.user_name as string | undefined) ??
                      user?.email ??
                      undefined
                    }
                  />
                  <ThemeToggle />
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </main>

            </div>

          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
