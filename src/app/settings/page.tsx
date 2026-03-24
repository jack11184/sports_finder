"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import {
  CableProvider,
  Team,
  UserProfile,
  UserFavoriteTeam,
  ViewMode,
} from "@/types/database";
import {
  ArrowLeft,
  MapPin,
  Tv,
  Heart,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Clock,
  X,
  Check,
  Search,
  Trash2,
} from "lucide-react";

const LEAGUE_LABELS: Record<string, string> = {
  nfl: "NFL",
  nba: "NBA",
  mlb: "MLB",
  nhl: "NHL",
  epl: "Premier League",
  laliga: "La Liga",
};

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

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<UserFavoriteTeam[]>([]);
  const [cableProviders, setCableProviders] = useState<CableProvider[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  const [zip, setZip] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [preferredView, setPreferredView] = useState<ViewMode>("grid");
  const [teamSearch, setTeamSearch] = useState("");
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, favoritesRes, providersRes, teamsRes] =
        await Promise.all([
          supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("user_favorite_teams")
            .select("*")
            .eq("user_id", user.id),
          supabase.from("cable_providers").select("*").order("name"),
          supabase.from("teams").select("*").order("name"),
        ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setZip(profileRes.data.location || "");
        setSelectedProvider(profileRes.data.cable_provider_id);
        setPreferredView(profileRes.data.preferred_view || "grid");
      }
      if (favoritesRes.data) setFavorites(favoritesRes.data);
      if (providersRes.data) setCableProviders(providersRes.data);
      if (teamsRes.data) setAllTeams(teamsRes.data);
    }

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .update({
        location: zip || null,
        timezone: zip ? ZIP_TIMEZONE_MAP[zip[0]] || "America/New_York" : null,
        cable_provider_id: selectedProvider,
        preferred_view: preferredView,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFavoriteTeam = async (team: Team) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_favorite_teams")
      .upsert(
        {
          user_id: user.id,
          team_id: team.id,
          league: team.league,
          team_name: team.name,
        },
        { onConflict: "user_id,team_id" }
      )
      .select()
      .single();

    if (data) {
      setFavorites((prev) => [...prev, data]);
    }
    setShowTeamPicker(false);
    setTeamSearch("");
  };

  const removeFavoriteTeam = async (favoriteId: string) => {
    const supabase = createClient();
    await supabase.from("user_favorite_teams").delete().eq("id", favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;

    const supabase = createClient();
    // Note: actual account deletion requires a server-side function
    // For now, sign out and redirect
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredTeams = allTeams.filter(
    (t) =>
      !favorites.some((f) => f.team_id === t.id) &&
      (!teamSearch ||
        t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        t.abbreviation.toLowerCase().includes(teamSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <Link
            href="/games"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        {/* Location */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <MapPin className="h-4 w-4" /> Location
          </h2>
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="ZIP code"
            className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-text-primary placeholder-text-muted outline-none focus:border-accent"
          />
        </section>

        {/* Cable Provider */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <Tv className="h-4 w-4" /> Cable Provider
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {cableProviders.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setSelectedProvider(
                    selectedProvider === p.id ? null : p.id
                  )
                }
                className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  selectedProvider === p.id
                    ? "border-accent bg-accent-bg text-accent"
                    : "border-border bg-bg-card text-text-primary hover:bg-bg-card-hover"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        {/* Favorite Teams */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <Heart className="h-4 w-4" /> Favorite Teams
          </h2>
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {fav.team_name}
                  </span>
                  <span className="ml-2 text-xs text-text-muted">
                    {LEAGUE_LABELS[fav.league] || fav.league.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => removeFavoriteTeam(fav.id)}
                  className="text-text-muted hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!showTeamPicker ? (
              <button
                onClick={() => setShowTeamPicker(true)}
                className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                + Add team
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border border-border bg-bg-card p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search teams..."
                    autoFocus
                    className="w-full rounded-lg border border-border bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
                  />
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredTeams.slice(0, 20).map((team) => (
                    <button
                      key={team.id}
                      onClick={() => addFavoriteTeam(team)}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-card-hover"
                    >
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xs text-text-muted">
                        {LEAGUE_LABELS[team.league] ||
                          team.league.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowTeamPicker(false);
                    setTeamSearch("");
                  }}
                  className="w-full text-center text-xs text-text-muted hover:text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Preferences
          </h2>

          {/* View mode */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3">
            <span className="text-sm text-text-primary">Default view</span>
            <div className="flex rounded-lg border border-border">
              {(
                [
                  { key: "grid" as ViewMode, icon: LayoutGrid },
                  { key: "list" as ViewMode, icon: List },
                  { key: "timeline" as ViewMode, icon: Clock },
                ] as const
              ).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPreferredView(key)}
                  className={`px-3 py-1.5 first:rounded-l-lg last:rounded-r-lg ${
                    preferredView === key
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-bg-card-hover"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3">
            <span className="text-sm text-text-primary">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg bg-bg-secondary px-3 py-1.5 text-sm text-text-secondary"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="h-4 w-4" /> Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" /> Light
                </>
              )}
            </button>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" /> Saved!
            </span>
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Danger zone */}
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-red-500">
            Danger Zone
          </h2>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}
