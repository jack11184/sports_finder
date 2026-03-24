"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CableProvider, Team } from "@/types/database";
import {
  MapPin,
  Tv,
  Heart,
  ChevronRight,
  SkipForward,
  Search,
  X,
  Check,
} from "lucide-react";

const ZIP_TIMEZONE_MAP: Record<string, string> = {
  "0": "America/New_York",
  "1": "America/New_York",
  "2": "America/New_York",
  "3": "America/New_York",
  "4": "America/New_York",
  "5": "America/Chicago",
  "6": "America/Chicago",
  "7": "America/Chicago",
  "8": "America/Denver",
  "9": "America/Los_Angeles",
};

function getTimezoneFromZip(zip: string): string {
  return ZIP_TIMEZONE_MAP[zip[0]] || "America/New_York";
}

const LEAGUE_LABELS: Record<string, string> = {
  nfl: "NFL",
  nba: "NBA",
  mlb: "MLB",
  nhl: "NHL",
  epl: "Premier League",
  laliga: "La Liga",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [zip, setZip] = useState("");
  const [locating, setLocating] = useState(false);
  const [cableProviders, setCableProviders] = useState<CableProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [teamSearch, setTeamSearch] = useState("");
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("cable_providers")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setCableProviders(data);
      });

    supabase
      .from("teams")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setTeams(data);
      });
  }, []);

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      // Simple reverse geocode using a free API
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}`
      );
      const data = await res.json();
      if (data.postcode) {
        setZip(data.postcode);
      }
    } catch {
      // Geolocation failed, user can enter manually
    }
    setLocating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Update profile
    await supabase
      .from("user_profiles")
      .update({
        location: zip || null,
        timezone: zip ? getTimezoneFromZip(zip) : null,
        cable_provider_id: selectedProvider,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // Save favorite teams
    if (selectedTeams.size > 0) {
      const teamEntries = Array.from(selectedTeams).map((teamId) => {
        const team = teams.find((t) => t.id === teamId);
        return {
          user_id: user.id,
          team_id: teamId,
          league: team?.league || "",
          team_name: team?.name || "",
        };
      });

      await supabase.from("user_favorite_teams").upsert(teamEntries, {
        onConflict: "user_id,team_id",
      });
    }

    setSaving(false);
    router.push("/games");
    router.refresh();
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const leagues = [...new Set(teams.map((t) => t.league))];
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      !teamSearch ||
      t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.abbreviation.toLowerCase().includes(teamSearch.toLowerCase());
    const matchesLeague = !activeLeague || t.league === activeLeague;
    return matchesSearch && matchesLeague;
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  s === step
                    ? "bg-accent text-white"
                    : s < step
                      ? "bg-accent/20 text-accent"
                      : "bg-bg-card text-text-muted"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    s < step ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-accent" />
              <h2 className="mt-4 text-2xl font-bold text-text-primary">
                Where are you located?
              </h2>
              <p className="mt-2 text-text-secondary">
                We&apos;ll use this to show game times in your timezone and find
                your local channels
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="Enter ZIP code"
                className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
              />

              <div className="text-center text-sm text-text-muted">or</div>

              <button
                onClick={handleUseLocation}
                disabled={locating}
                className="w-full rounded-lg border border-accent bg-transparent py-3 text-accent transition-colors hover:bg-accent-bg"
              >
                {locating ? "Detecting location..." : "Use my location"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg border border-border py-3 text-text-secondary transition-colors hover:bg-bg-card"
              >
                <SkipForward className="mr-2 inline h-4 w-4" />
                Skip
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Next
                <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Cable Provider */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Tv className="mx-auto h-12 w-12 text-accent" />
              <h2 className="mt-4 text-2xl font-bold text-text-primary">
                What&apos;s your cable provider?
              </h2>
              <p className="mt-2 text-text-secondary">
                We&apos;ll show you the exact channel numbers for your package
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {cableProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() =>
                    setSelectedProvider(
                      selectedProvider === provider.id ? null : provider.id
                    )
                  }
                  className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                    selectedProvider === provider.id
                      ? "border-accent bg-accent-bg text-accent"
                      : "border-border bg-bg-card text-text-primary hover:bg-bg-card-hover"
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedProvider(null)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                selectedProvider === null
                  ? "border-accent bg-accent-bg text-accent"
                  : "border-border bg-bg-card text-text-secondary hover:bg-bg-card-hover"
              }`}
            >
              I don&apos;t have cable / Streaming only
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg border border-border py-3 text-text-secondary transition-colors hover:bg-bg-card"
              >
                <SkipForward className="mr-2 inline h-4 w-4" />
                Skip
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Next
                <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Favorite Teams */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="mx-auto h-12 w-12 text-accent" />
              <h2 className="mt-4 text-2xl font-bold text-text-primary">
                Pick your favorite teams
              </h2>
              <p className="mt-2 text-text-secondary">
                We&apos;ll highlight their games and make them easy to find
              </p>
            </div>

            {/* Selected teams */}
            {selectedTeams.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedTeams).map((id) => {
                  const team = teams.find((t) => t.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleTeam(id)}
                      className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-sm text-white"
                    >
                      {team?.abbreviation || id}
                      <X className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search teams..."
                className="w-full rounded-lg border border-border bg-bg-input py-3 pl-10 pr-4 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
              />
            </div>

            {/* League filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveLeague(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  !activeLeague
                    ? "bg-pill-active-bg text-pill-active-text"
                    : "bg-pill-bg text-pill-text hover:bg-bg-card-hover"
                }`}
              >
                All
              </button>
              {leagues.map((league) => (
                <button
                  key={league}
                  onClick={() =>
                    setActiveLeague(activeLeague === league ? null : league)
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeLeague === league
                      ? "bg-pill-active-bg text-pill-active-text"
                      : "bg-pill-bg text-pill-text hover:bg-bg-card-hover"
                  }`}
                >
                  {LEAGUE_LABELS[league] || league.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Team list */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    selectedTeams.has(team.id)
                      ? "border-accent bg-accent-bg"
                      : "border-border bg-bg-card hover:bg-bg-card-hover"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                    {team.abbreviation}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-text-primary">
                      {team.name}
                    </div>
                    <div className="text-xs text-text-muted">
                      {LEAGUE_LABELS[team.league] || team.league.toUpperCase()}
                    </div>
                  </div>
                  {selectedTeams.has(team.id) && (
                    <Check className="h-5 w-5 text-accent" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & View Games"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
