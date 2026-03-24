type AuthPageShellProps = {
  cardTitle?: string;
  children: React.ReactNode;
};

/**
 * Matches Figma Make auth layout: brand block + card on bg-primary.
 */
export function AuthPageShell({ cardTitle, children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl text-text-primary">Sports Finder</h1>
          <p className="text-text-secondary">Never miss a game</p>
        </div>
        <div className="space-y-6 rounded-xl bg-bg-card p-8">
          {cardTitle ? (
            <h2 className="text-center text-xl text-text-primary">{cardTitle}</h2>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
