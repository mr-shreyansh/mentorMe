import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from '@/components/ProgressProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProgressProvider>
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
              <header className="flex justify-between items-center mb-10 w-full px-6 py-4 nm-flat rounded-full">
                <div className="font-extrabold text-xl tracking-wider text-[var(--heading-color)]">
                  Pro<span className="text-orange-500">Trainer</span>
                </div>
                <ThemeToggle />
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
