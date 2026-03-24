"use client";

import { useState } from "react";
import Image from "next/image";
import { GameCache, ResolvedChannel } from "@/types/database";
import { resolveBroadcastInfo } from "@/lib/broadcast";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, MapPin, Plus, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GameCardProps {
  game: GameCache;
  channelMappings?: Map<string, string>;
  userTimezone?: string;
  onChannelAdded?: (networkName: string, channelNumber: string) => void;
}

const LEAGUE_COLORS: Record<string, string> = {
  nfl: "#1e40af",
  nba: "#dc2626",
  mlb: "#0891b2",
  nhl: "#7c3aed",
  mls: "#059669",
  epl: "#db2777",
  laliga: "#ea580c",
  ucl: "#003899",
  ncaaf: "#8B0000",
  ncaam: "#FF6600",
  f1: "#ef4444",
};

function ChannelPill({
  channel,
  onAddChannel,
}: {
  channel: ResolvedChannel;
  onAddChannel?: (networkName: string) => void;
}) {
  const isStreaming = channel.type === "streaming";

  // Cable/broadcast with channel number — accent bg pill
  if (!isStreaming && channel.channel_number) {
    return (
      <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm bg-accent text-white">
        {channel.network_name} Ch. {channel.channel_number}
      </span>
    );
  }

  // Streaming — solid border pill
  if (isStreaming) {
    return (
      <span className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-sm bg-bg-primary text-text-primary">
        {channel.network_name}
      </span>
    );
  }

  // No channel number — dashed border with plus icon
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddChannel?.(channel.network_name);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-sm bg-bg-primary text-text-primary transition-colors hover:border-accent hover:text-accent"
      title={`Add channel number for ${channel.network_name}`}
    >
      {channel.network_name}
      <Plus className="h-3 w-3 text-text-muted" />
    </button>
  );
}

export default function GameCard({
  game,
  channelMappings,
  onChannelAdded,
}: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<string | null>(null);
  const [channelInput, setChannelInput] = useState("");
  const [saving, setSaving] = useState(false);

  const channels = resolveBroadcastInfo(game.broadcast_info, channelMappings);
  const primaryChannel = channels.find((c) => c.type !== "streaming");
  const primaryStreaming = channels.find((c) => c.type === "streaming");

  const gameTime = new Date(game.start_time);
  const timeString = format(gameTime, "h:mm a");

  const homeAbbr =
    game.home_team_id?.split("-").pop()?.toUpperCase() ||
    game.home_team_name.split(" ").pop()?.slice(0, 3).toUpperCase() ||
    "???";
  const awayAbbr =
    game.away_team_id?.split("-").pop()?.toUpperCase() ||
    game.away_team_name.split(" ").pop()?.slice(0, 3).toUpperCase() ||
    "???";

  const leagueColor = LEAGUE_COLORS[game.league] || "#666";

  const getChannelDisplay = () => {
    if (primaryChannel) {
      if (primaryChannel.channel_number) {
        return `${primaryChannel.network_name} Ch. ${primaryChannel.channel_number}`;
      }
      return primaryChannel.network_name;
    }
    if (primaryStreaming) {
      return primaryStreaming.network_name;
    }
    return "Broadcast TBD";
  };

  const handleAddChannel = (networkName: string) => {
    setEditingNetwork(networkName);
    setChannelInput("");
    setExpanded(true);
  };

  const handleSaveChannel = async () => {
    if (!editingNetwork || !channelInput.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("user_channel_mappings").upsert(
        {
          user_id: user.id,
          network_name: editingNetwork,
          channel_number: channelInput.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,network_name" }
      );

      onChannelAdded?.(editingNetwork, channelInput.trim());
    }

    setEditingNetwork(null);
    setChannelInput("");
    setSaving(false);
  };

  const cancelEditing = () => {
    setEditingNetwork(null);
    setChannelInput("");
  };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all bg-bg-card border-border"
    >
      {/* Compact View */}
      <button
        onClick={() => {
          if (!editingNetwork) setExpanded(!expanded);
        }}
        className="w-full p-4 text-left transition-colors hover:bg-bg-card-hover"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Badge + logos stay compact; matchup gets the flexible middle */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className="rounded px-2 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: leagueColor }}
            >
              {game.league.toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              {game.away_team_logo ? (
                <Image
                  src={game.away_team_logo}
                  alt={game.away_team_name}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-contain bg-bg-primary"
                  unoptimized
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-primary text-[10px] font-bold text-text-secondary">
                  {awayAbbr}
                </div>
              )}
              {game.home_team_logo ? (
                <Image
                  src={game.home_team_logo}
                  alt={game.home_team_name}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-contain bg-bg-primary"
                  unoptimized
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-primary text-[10px] font-bold text-text-secondary">
                  {homeAbbr}
                </div>
              )}
            </div>
          </div>

          <p className="line-clamp-2 min-w-0 flex-1 text-pretty text-sm leading-snug text-text-primary">
            <span className="text-text-primary">{game.away_team_name}</span>
            <span className="mx-1.5 text-text-muted">vs</span>
            <span className="text-text-primary">{game.home_team_name}</span>
          </p>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {game.status === "in_progress" && (
                  <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-live-green text-bg-primary">
                    LIVE
                  </span>
                )}
                {game.status === "final" && (
                  <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-text-muted text-text-primary">
                    Final
                  </span>
                )}
                {game.status === "postponed" && (
                  <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-yellow-500 text-bg-primary">
                    PPD
                  </span>
                )}
                <span className="whitespace-nowrap text-sm text-text-primary">
                  {timeString}
                </span>
              </div>
              <p className="mt-0.5 max-w-[min(100%,14rem)] text-xs text-text-secondary sm:ml-auto sm:max-w-[16rem]">
                <span className="block truncate text-right">
                  {getChannelDisplay()}
                </span>
              </p>
            </div>

            {expanded ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded View */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {/* Team Details */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {game.away_team_logo ? (
                  <Image
                    src={game.away_team_logo}
                    alt={game.away_team_name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-contain bg-bg-primary"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-bg-primary text-sm font-bold text-text-secondary">
                    {awayAbbr}
                  </div>
                )}
                <div>
                  <p className="text-text-primary">{game.away_team_name}</p>
                  {game.away_team_record && (
                    <p className="text-xs text-text-muted">
                      {game.away_team_record}
                    </p>
                  )}
                </div>
              </div>
              {game.home_score != null && game.away_score != null && (
                <p className="text-xl text-text-primary">{game.away_score}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {game.home_team_logo ? (
                  <Image
                    src={game.home_team_logo}
                    alt={game.home_team_name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-contain bg-bg-primary"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-bg-primary text-sm font-bold text-text-secondary">
                    {homeAbbr}
                  </div>
                )}
                <div>
                  <p className="text-text-primary">{game.home_team_name}</p>
                  {game.home_team_record && (
                    <p className="text-xs text-text-muted">
                      {game.home_team_record}
                    </p>
                  )}
                </div>
              </div>
              {game.home_score != null && game.away_score != null && (
                <p className="text-xl text-text-primary">{game.home_score}</p>
              )}
            </div>
          </div>

          {/* Venue */}
          {game.venue && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-secondary" />
              <p className="text-sm text-text-secondary">{game.venue}</p>
            </div>
          )}

          {/* Broadcast Options */}
          {channels.length > 0 && (
            <div>
              <p className="text-xs mb-2 text-text-muted">Watch on:</p>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel, i) => {
                  if (editingNetwork === channel.network_name) {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border bg-bg-primary border-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-text-primary">
                          {channel.network_name} Ch.
                        </span>
                        <input
                          type="text"
                          value={channelInput}
                          onChange={(e) => setChannelInput(e.target.value)}
                          placeholder="###"
                          className="w-12 px-1 text-sm bg-transparent border-b border-accent text-text-primary focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveChannel();
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        <button
                          onClick={handleSaveChannel}
                          disabled={saving || !channelInput.trim()}
                          className="p-1 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 text-live-green" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 transition-colors"
                        >
                          <X className="w-4 h-4 text-text-muted" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <ChannelPill
                      key={i}
                      channel={channel}
                      onAddChannel={handleAddChannel}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {channels.length === 0 && (
            <p className="text-xs text-text-muted">Broadcast TBD</p>
          )}
        </div>
      )}
    </div>
  );
}
