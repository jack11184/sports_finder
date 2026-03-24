"use client";

import { GameCache } from "@/types/database";
import GameCard from "./GameCard";
import { format } from "date-fns";

interface TimelineViewProps {
  games: GameCache[];
  channelMappings?: Map<string, string>;
  userTimezone?: string;
}

export default function TimelineView({
  games,
  channelMappings,
  userTimezone,
}: TimelineViewProps) {
  // Group games by hour
  const grouped = games.reduce<Record<string, GameCache[]>>((acc, game) => {
    const hour = format(new Date(game.start_time), "h:mm a");
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(game);
    return acc;
  }, {});

  const sortedTimes = Object.keys(grouped).sort((a, b) => {
    const timeA = new Date(grouped[a][0].start_time).getTime();
    const timeB = new Date(grouped[b][0].start_time).getTime();
    return timeA - timeB;
  });

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-accent/30" />

      <div className="space-y-8">
        {sortedTimes.map((time) => (
          <div key={time} className="relative">
            {/* Time marker dot */}
            <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-bg-primary" />

            {/* Time label */}
            <div className="mb-3 text-sm font-bold text-accent">{time}</div>

            {/* Games at this time */}
            <div className="space-y-2">
              {grouped[time].map((game) => (
                <GameCard
                  key={game.id || game.external_id}
                  game={game}
                  channelMappings={channelMappings}
                  userTimezone={userTimezone}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
