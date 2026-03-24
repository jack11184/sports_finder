import Link from "next/link";
import {
  Tv,
  Monitor,
  Star,
  Calendar,
  ArrowRight,
  Zap,
  MapPin,
  ShieldCheck,
  Clock3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.24),transparent_36%),radial-gradient(circle_at_80%_25%,rgba(34,197,94,0.12),transparent_32%),linear-gradient(180deg,transparent,rgba(15,17,23,0.65))]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:gap-12 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              Built for game night
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-6xl">
              Find every game.
              <br />
              <span className="text-accent">Know exactly where to watch.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
              Sports Finder turns schedules into instant watch plans with real
              channels, streaming options, and your favorite teams first.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-primary/60 px-7 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-bg-card"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <StatPill label="11 leagues" />
              <StatPill label="Live game status" />
              <StatPill label="Your channel map" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-bg-card/80 p-4 shadow-[0_20px_80px_-32px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Tonight&apos;s top slate
                </p>
                <p className="text-xs text-text-muted">
                  Personalized for your providers and teams
                </p>
              </div>
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                Live
              </span>
            </div>
            <div className="space-y-3">
              <PreviewGame
                league="NBA"
                matchup="Lakers vs Celtics"
                time="8:30 PM"
                watch="ESPN Ch. 206"
              />
              <PreviewGame
                league="MLB"
                matchup="Yankees vs Rays"
                time="7:05 PM"
                watch="YES Ch. 631"
              />
              <PreviewGame
                league="NHL"
                matchup="Bruins vs Leafs"
                time="9:00 PM"
                watch="NESN 360"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <QuickFact icon={<MapPin className="mx-auto mb-1 h-3.5 w-3.5" />} label="ZIP-aware" />
              <QuickFact icon={<Clock3 className="mx-auto mb-1 h-3.5 w-3.5" />} label="Realtime" />
              <QuickFact icon={<ShieldCheck className="mx-auto mb-1 h-3.5 w-3.5" />} label="No spam" />
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="border-b border-border/70 bg-bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-text-primary">
            From schedule to stream in 3 plays
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FlowCard
              index="01"
              title="Set your setup"
              description="Pick location and cable provider once to map exact channel numbers."
            />
            <FlowCard
              index="02"
              title="Choose favorites"
              description="Follow your teams and filter every slate down to what matters."
            />
            <FlowCard
              index="03"
              title="Watch instantly"
              description="Open card, see network + stream options, and never hunt around."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold text-text-primary">
              Built for modern sports fans
            </h2>
            <p className="hidden max-w-xs text-right text-sm text-text-secondary md:block">
              Designed for people who follow multiple leagues and hate channel
              roulette.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Full Schedule"
              description="All games in one place across major leagues, every day."
            />
            <FeatureCard
              icon={<Tv className="h-6 w-6" />}
              title="Provider Channels"
              description="Mapped channel numbers for your cable or TV provider."
            />
            <FeatureCard
              icon={<Monitor className="h-6 w-6" />}
              title="Streaming Coverage"
              description="See stream options like ESPN+, Prime, Peacock, and more."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Favorites First"
              description="Prioritize matchups involving teams you actually care about."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Multiple Views"
              description="Grid, grouped list, or timeline based on how you browse."
            />
            <FeatureCard
              icon={<ArrowRight className="h-6 w-6" />}
              title="Quick Setup"
              description="Get personalized in minutes without complicated settings."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-border bg-bg-card px-6 py-10 text-center sm:px-10">
            <h2 className="text-3xl font-bold text-text-primary">
              Ready to stop guessing where games are on?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
              Create a free account and get personalized schedules, channels,
              and streaming coverage in one clean view.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-bg-primary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-text-muted">
          Sports Finder
        </div>
      </footer>
    </div>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-bg-card/70 px-3 py-1 text-xs font-medium text-text-secondary">
      {label}
    </span>
  );
}

function PreviewGame({
  league,
  matchup,
  time,
  watch,
}: {
  league: string;
  matchup: string;
  time: string;
  watch: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-bg-primary/70 px-3 py-2.5">
      <div className="min-w-0">
        <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          {league}
        </span>
        <p className="mt-1 truncate text-sm font-semibold text-text-primary">
          {matchup}
        </p>
        <p className="truncate text-xs text-text-muted">{watch}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-text-secondary">
        {time}
      </span>
    </div>
  );
}

function QuickFact({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-bg-primary/60 px-2 py-2 text-text-secondary">
      {icon}
      <p>{label}</p>
    </div>
  );
}

function FlowCard({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="text-xs font-semibold tracking-[0.12em] text-accent">{index}</p>
      <h3 className="mt-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
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
    <div className="rounded-xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-lg">
      <div className="mb-4 inline-flex rounded-lg bg-accent/15 p-2 text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
