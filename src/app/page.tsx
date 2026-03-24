import Link from "next/link";
import {
  Tv,
  Monitor,
  Star,
  Calendar,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-6xl">
            Never miss a game.
            <br />
            <span className="text-accent">Know where to watch.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Set your cable provider and favorite teams. We show you every game,
            what channel it&apos;s on, and which streaming platforms carry it —
            all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-semibold text-text-primary transition-colors hover:bg-bg-card"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border bg-bg-secondary py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            Everything you need to watch sports
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Full Schedule"
              description="See every game across NFL, NBA, MLB, NHL, Premier League, La Liga, and more — today or any day this week."
            />
            <FeatureCard
              icon={<Tv className="h-8 w-8" />}
              title="Your Channel Numbers"
              description="Set your cable provider and see exact channel numbers. No more scrolling through the guide."
            />
            <FeatureCard
              icon={<Monitor className="h-8 w-8" />}
              title="Streaming Platforms"
              description="Know if a game is on ESPN+, Peacock, Amazon Prime, or any other streaming service."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8" />}
              title="Favorite Teams"
              description="Add your teams and filter to see only what matters to you. No noise, just your games."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Three Views"
              description="Card grid, grouped list, or timeline — pick the layout that works for you."
            />
            <FeatureCard
              icon={<ArrowRight className="h-8 w-8" />}
              title="Quick Setup"
              description="Three simple steps: location, cable provider, favorite teams. You're watching in under a minute."
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-text-primary">
            Ready to find your games?
          </h2>
          <p className="mt-4 text-text-secondary">
            Free to use. No credit card required.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-text-muted">
          Sports Finder
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6 transition-shadow hover:shadow-card-lg">
      <div className="mb-4 text-accent">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
