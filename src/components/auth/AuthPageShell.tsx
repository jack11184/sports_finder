import { Tv } from "lucide-react";

type AuthPageShellProps = {
  cardTitle?: string;
  children: React.ReactNode;
};

/**
 * Auth layout: one card with brand lockup (TV icon + wordmark, same family as app header)
 * and form content below.
 */
export function AuthPageShell({ cardTitle, children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-6">
      <div className="w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-border/60 bg-bg-card p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-12px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/40 ring-1 ring-white/15"
              aria-hidden
            >
              <Tv className="h-7 w-7 text-white" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 text-left">
              <p className="text-xl font-bold tracking-tight text-text-primary">
                Sports Finder
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Never miss a game
              </p>
            </div>
          </div>

          {cardTitle ? (
            <h2 className="text-center text-xl font-semibold text-text-primary">
              {cardTitle}
            </h2>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
