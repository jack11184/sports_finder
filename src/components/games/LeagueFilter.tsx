"use client";

import { Star } from "lucide-react";

const LEAGUES = [
  { key: "all", label: "All" },
  { key: "favorites", label: "Favorites" },
  { key: "nfl", label: "NFL" },
  { key: "nba", label: "NBA" },
  { key: "mlb", label: "MLB" },
  { key: "nhl", label: "NHL" },
  { key: "mls", label: "MLS" },
  { key: "epl", label: "EPL" },
  { key: "laliga", label: "La Liga" },
  { key: "ucl", label: "UCL" },
  { key: "ncaaf", label: "NCAAF" },
  { key: "ncaam", label: "NCAAM" },
  { key: "f1", label: "F1" },
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
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {visibleLeagues.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === key
              ? "bg-pill-active-bg text-pill-active-text"
              : "bg-pill-bg text-pill-text hover:bg-bg-card-hover"
          }`}
        >
          {key === "favorites" && <Star className="h-3 w-3" />}
          {label}
        </button>
      ))}
    </div>
  );
}
