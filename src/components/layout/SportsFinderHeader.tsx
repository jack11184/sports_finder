"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, Settings, LogOut, Tv } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type SportsFinderHeaderProps = {
  onLogout: () => void | Promise<void>;
};

export function SportsFinderHeader({ onLogout }: SportsFinderHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/95 backdrop-blur-md">
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2.5 rounded-xl py-1 pr-2 text-left transition-colors hover:bg-bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 sm:max-w-none sm:gap-3"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent shadow-md shadow-accent/25 ring-1 ring-white/10 sm:h-9 sm:w-9"
            aria-hidden
          >
            <Tv className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold tracking-tight text-text-primary text-[1.05rem] sm:text-lg">
              Sports{" "}
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                Finder
              </span>
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted sm:block">
              Never miss a game
            </span>
          </span>
        </button>

        <nav
          className="flex shrink-0 items-center gap-1 sm:gap-1.5"
          aria-label="App actions"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-transparent p-2.5 text-text-secondary transition-all hover:border-border hover:bg-bg-card hover:text-text-primary active:scale-[0.97] sm:p-2"
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
          <Link
            href="/settings"
            className="rounded-xl border border-transparent p-2.5 text-text-secondary transition-all hover:border-border hover:bg-bg-card hover:text-text-primary active:scale-[0.97] sm:p-2"
            title="Settings"
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-xl border border-transparent p-2.5 text-text-secondary transition-all hover:border-border hover:bg-bg-card hover:text-text-primary active:scale-[0.97] sm:p-2"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </header>
  );
}
