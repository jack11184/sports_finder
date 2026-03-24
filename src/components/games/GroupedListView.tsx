"use client";

import { GameCache } from "@/types/database";
import GameCard from "./GameCard";

const LEAGUE_LABELS: Record<string, string> = {
  nfl: "NFL",
  nba: "NBA",
  mlb: "MLB",
  nhl: "NHL",
  mls: "MLS",
  epl: "Premier League",
  laliga: "La Liga",
  ucl: "Champions League",
  ncaaf: "NCAA Football",
  ncaam: "NCAA Basketball",
  f1: "Formula 1",
};

interface GroupedListViewProps {
  games: GameCache[];
  channelMappings?: Map<string, string>;
  userTimezone?: string;
  onChannelAdded?: (networkName: string, channelNumber: string) => void;
}

export default function GroupedListView({
  games,
  channelMappings,
  userTimezone,
  onChannelAdded,
}: GroupedListViewProps) {
  // Group games by league
  const grouped = games.reduce<Record<string, GameCache[]>>((acc, game) => {
    const key = game.league;
    if (!acc[key]) acc[key] = [];
    acc[key].push(game);
    return acc;
  }, {});

  const leagueOrder = [
    "nfl",
    "nba",
    "mlb",
    "nhl",
    "mls",
    "epl",
    "laliga",
    "ucl",
    "ncaaf",
    "ncaam",
    "f1",
  ];

  const sortedLeagues = Object.keys(grouped).sort(
    (a, b) =>
      (leagueOrder.indexOf(a) === -1 ? 999 : leagueOrder.indexOf(a)) -
      (leagueOrder.indexOf(b) === -1 ? 999 : leagueOrder.indexOf(b))
  );

  return (
    <div className="space-y-6">
      {sortedLeagues.map((league) => (
        <div key={league}>
          <h3 className="mb-3 border-b border-border pb-2 text-sm font-bold text-accent">
            {LEAGUE_LABELS[league] || league.toUpperCase()}
          </h3>
          <div className="space-y-2">
            {grouped[league].map((game) => (
              <GameCard
                key={game.id || game.external_id}
                game={game}
                channelMappings={channelMappings}
                userTimezone={userTimezone}
                onChannelAdded={onChannelAdded}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
