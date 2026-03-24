"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import {
  GameCache,
  UserProfile,
  UserFavoriteTeam,
  ViewMode,
} from "@/types/database";
import DatePicker from "@/components/games/DatePicker";
import LeagueFilter from "@/components/games/LeagueFilter";
import ViewToggle from "@/components/games/ViewToggle";
import CardGridView from "@/components/games/CardGridView";
import GroupedListView from "@/components/games/GroupedListView";
import TimelineView from "@/components/games/TimelineView";
import {
  Sun,
  Moon,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GamesPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [games, setGames] = useState<GameCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<UserFavoriteTeam[]>([]);
  const [channelMappings, setChannelMappings] = useState<Map<string, string>>(
    new Map()
  );

  // Fetch user profile and favorites
  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, favoritesRes] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_favorite_teams")
          .select("*")
          .eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setViewMode(profileRes.data.preferred_view || "grid");

        const mappings = new Map<string, string>();

        // Load provider defaults first
        if (profileRes.data.cable_provider_id) {
          const { data: channels } = await supabase
            .from("cable_channel_mappings")
            .select("*")
            .eq("cable_provider_id", profileRes.data.cable_provider_id);

          if (channels) {
            for (const ch of channels) {
              if (
                !ch.region ||
                (profileRes.data.location &&
                  profileRes.data.location.startsWith(ch.region))
              ) {
                mappings.set(ch.network_name, ch.channel_number);
              }
            }
          }
        }

        // Layer user custom mappings on top (overrides provider defaults)
        const { data: userChannels } = await supabase
          .from("user_channel_mappings")
          .select("*")
          .eq("user_id", user.id);

        if (userChannels) {
          for (const ch of userChannels) {
            mappings.set(ch.network_name, ch.channel_number);
          }
        }

        setChannelMappings(mappings);
      }

      if (favoritesRes.data) {
        setFavorites(favoritesRes.data);
      }
    }

    loadUserData();
  }, []);

  // Fetch games for selected date
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const dateStr = format(selectedDate, "yyyyMMdd");
      const tzOffset = new Date().getTimezoneOffset();
      const response = await fetch(`/api/games?date=${dateStr}&tz=${-tzOffset}`);
      const data = await response.json();

      if (data.games) {
        setGames(data.games);
      } else {
        setGames([]);
      }
    } catch {
      setError(true);
      setGames([]);
    }

    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Filter games
  const filteredGames = games.filter((game) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "favorites") {
      const favoriteTeamIds = new Set(favorites.map((f) => f.team_id));
      return (
        favoriteTeamIds.has(game.home_team_id) ||
        favoriteTeamIds.has(game.away_team_id)
      );
    }
    return game.league === activeFilter;
  });

  const availableLeagues = new Set(games.map((g) => g.league));

  const handleChannelAdded = useCallback(
    (networkName: string, channelNumber: string) => {
      setChannelMappings((prev) => {
        const next = new Map(prev);
        next.set(networkName, channelNumber);
        return next;
      });
    },
    []
  );

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-primary px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1
            className="text-xl cursor-pointer text-text-primary"
            onClick={() => router.push("/")}
          >
            Sports Finder
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-text-secondary" />
              ) : (
                <Moon className="w-5 h-5 text-text-secondary" />
              )}
            </button>
            <Link
              href="/settings"
              className="p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors"
            >
              <Settings className="w-5 h-5 text-text-secondary" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-bg-card hover:bg-bg-card-hover transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Date Picker */}
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* League Filters */}
        <LeagueFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          availableLeagues={availableLeagues}
        />

        {/* View Mode Toggle + Game Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {filteredGames.length}{" "}
            {filteredGames.length === 1 ? "game" : "games"} scheduled
          </p>
          <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
        </div>

        {/* Favorites banner */}
        {favorites.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-bg px-4 py-3 text-sm text-accent">
            <Star className="h-4 w-4" />
            <span>
              Add your favorite teams in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>{" "}
              to filter games
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <AlertCircle className="mb-4 h-12 w-12 text-text-muted" />
            <p>Game data is temporarily unavailable.</p>
            <p className="text-sm">Please check back shortly.</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <p className="text-lg">
              No games scheduled for {format(selectedDate, "MMMM d, yyyy")}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Try browsing another day
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "w-full" : "space-y-4"}>
            {viewMode === "grid" && (
              <CardGridView
                games={filteredGames}
                channelMappings={channelMappings}
                userTimezone={profile?.timezone || undefined}
                onChannelAdded={handleChannelAdded}
              />
            )}
            {viewMode === "list" && (
              <GroupedListView
                games={filteredGames}
                channelMappings={channelMappings}
                userTimezone={profile?.timezone || undefined}
                onChannelAdded={handleChannelAdded}
              />
            )}
            {viewMode === "timeline" && (
              <TimelineView
                games={filteredGames}
                channelMappings={channelMappings}
                userTimezone={profile?.timezone || undefined}
                onChannelAdded={handleChannelAdded}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
