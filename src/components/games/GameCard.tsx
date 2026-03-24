"use client";

import { useState } from "react";
import { GameCache, ResolvedChannel } from "@/types/database";
import { resolveBroadcastInfo } from "@/lib/broadcast";
import { format } from "date-fns";
import { ChevronDown, MapPin, Tv } from "lucide-react";

interface GameCardProps {
  game: GameCache;
  channelMappings?: Map<string, string>;
  userTimezone?: string;
}

const LEAGUE_COLORS: Record<string, string> = {
  nfl: "#013369",
  nba: "#1D428A",
  mlb: "#002D72",
  nhl: "#000000",
  mls: "#80B214",
  epl: "#3D195B",
  laliga: "#FF4B44",
  ucl: "#003899",
  ncaaf: "#8B0000",
  ncaam: "#FF6600",
  f1: "#E10600",
};

function getStatusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return (
        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-500">
          LIVE
        </span>
      );
    case "final":
      return (
        <span className="rounded-full bg-text-muted/20 px-2 py-0.5 text-xs font-medium text-text-muted">
          Final
        </span>
      );
    case "postponed":
      return (
        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500">
          PPD
        </span>
      );
    default:
      return null;
  }
}

function ChannelPill({ channel }: { channel: ResolvedChannel }) {
  const isStreaming = channel.type === "streaming";
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
        isStreaming
          ? "bg-bg-secondary text-text-secondary"
          : "border border-accent/50 bg-accent-bg text-accent"
      }`}
    >
      {channel.network_name}
      {channel.channel_number && ` Ch. ${channel.channel_number}`}
    </span>
  );
}

export default function GameCard({
  game,
  channelMappings,
  userTimezone,
}: GameCardProps) {
  const [expanded, setExpanded] = useState(false);

  const channels = resolveBroadcastInfo(game.broadcast_info, channelMappings);
  const primaryChannel = channels.find((c) => c.type !== "streaming");
  const primaryStreaming = channels.find((c) => c.type === "streaming");

  const gameTime = new Date(game.start_time);
  const timeString = format(gameTime, "h:mm a");

  // Extract abbreviations from team names (last word or known pattern)
  const homeAbbr =
    game.home_team_id?.split("-").pop()?.toUpperCase() ||
    game.home_team_name.split(" ").pop()?.slice(0, 3).toUpperCase() ||
    "???";
  const awayAbbr =
    game.away_team_id?.split("-").pop()?.toUpperCase() ||
    game.away_team_name.split(" ").pop()?.slice(0, 3).toUpperCase() ||
    "???";

  const leagueColor = LEAGUE_COLORS[game.league] || "#666";

  return (
    <div
      className={`cursor-pointer rounded-xl border transition-all ${
        expanded
          ? "border-accent shadow-card-lg"
          : "border-border shadow-card hover:border-border hover:shadow-card-lg"
      } bg-bg-card`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact view */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* League badge */}
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-[9px] font-bold text-white"
            style={{ backgroundColor: leagueColor }}
          >
            {game.league.slice(0, 3).toUpperCase()}
          </div>

          {/* Teams */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                  {awayAbbr}
                </div>
                <span className="text-xs text-text-muted">@</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                  {homeAbbr}
                </div>
              </div>
              <span className="text-sm font-semibold text-text-primary">
                {awayAbbr} vs {homeAbbr}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              {getStatusBadge(game.status)}
              <span className="text-sm text-text-secondary">{timeString}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              {primaryChannel && (
                <span className="text-xs text-accent">
                  {primaryChannel.network_name}
                  {primaryChannel.channel_number &&
                    ` (Ch. ${primaryChannel.channel_number})`}
                </span>
              )}
              {primaryStreaming && primaryChannel && (
                <span className="text-xs text-text-muted">|</span>
              )}
              {primaryStreaming && (
                <span className="text-xs text-text-secondary">
                  {primaryStreaming.network_name}
                </span>
              )}
              {!primaryChannel && !primaryStreaming && (
                <span className="text-xs text-text-muted">Broadcast TBD</span>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-border bg-bg-secondary/50 px-4 py-3">
          <div className="mb-3 flex items-center justify-between text-xs text-text-secondary">
            <span>
              {game.league.toUpperCase()}
              {game.round_info && ` · ${game.round_info}`}
            </span>
            {game.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {game.venue}
              </span>
            )}
          </div>

          {/* Full team names with records */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">
                {game.away_team_name}
              </div>
              {game.away_team_record && (
                <div className="text-xs text-text-muted">
                  {game.away_team_record}
                </div>
              )}
            </div>
            <span className="text-xs text-text-muted">at</span>
            <div className="text-right">
              <div className="text-sm font-medium text-text-primary">
                {game.home_team_name}
              </div>
              {game.home_team_record && (
                <div className="text-xs text-text-muted">
                  {game.home_team_record}
                </div>
              )}
            </div>
          </div>

          {/* All broadcast options */}
          {channels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Tv className="h-4 w-4 text-text-muted" />
              {channels.map((channel, i) => (
                <ChannelPill key={i} channel={channel} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Tv className="h-4 w-4" />
              Broadcast TBD
            </div>
          )}
        </div>
      )}
    </div>
  );
}
