"use client";

import { Star } from "lucide-react";

const LEAGUES = [
  { key: "all", label: "All", color: "#6366f1" },
  { key: "favorites", label: "Favorites", color: "#f59e0b" },
  { key: "nfl", label: "NFL", color: "#1e40af" },
  { key: "nba", label: "NBA", color: "#dc2626" },
  { key: "mlb", label: "MLB", color: "#0891b2" },
  { key: "nhl", label: "NHL", color: "#7c3aed" },
  { key: "mls", label: "MLS", color: "#059669" },
  { key: "epl", label: "EPL", color: "#db2777" },
  { key: "laliga", label: "La Liga", color: "#ea580c" },
  { key: "ucl", label: "UCL", color: "#003899" },
  { key: "ncaaf", label: "NCAAF", color: "#8B0000" },
  { key: "ncaam", label: "NCAAM", color: "#FF6600" },
  { key: "f1", label: "F1", color: "#ef4444" },
];

interface LeagueFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  availableLeagues?: Set<string>;
}

export default function LeagueFilter({
  activeFilter,
  onFilterChange,
  availableLeagues,
}: LeagueFilterProps) {
  const visibleLeagues = LEAGUES.filter(
    (l) =>
      l.key === "all" ||
      l.key === "favorites" ||
      !availableLeagues ||
      availableLeagues.has(l.key)
  );

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {visibleLeagues.map(({ key, label, color }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className="flex shrink-0 items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: isActive ? color : "var(--bg-card)",
              color: isActive ? "#f1f5f9" : "var(--text-secondary)",
            }}
          >
            {key === "favorites" && <Star className="h-3 w-3" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
