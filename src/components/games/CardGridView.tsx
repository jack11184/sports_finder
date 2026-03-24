"use client";

import { GameCache } from "@/types/database";
import GameCard from "./GameCard";

interface CardGridViewProps {
  games: GameCache[];
  channelMappings?: Map<string, string>;
  userTimezone?: string;
  onChannelAdded?: (networkName: string, channelNumber: string) => void;
}

export default function CardGridView({
  games,
  channelMappings,
  userTimezone,
  onChannelAdded,
}: CardGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {games.map((game) => (
        <GameCard
          key={game.id || game.external_id}
          game={game}
          channelMappings={channelMappings}
          userTimezone={userTimezone}
          onChannelAdded={onChannelAdded}
        />
      ))}
    </div>
  );
}
