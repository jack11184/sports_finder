"use client";

import { useState } from "react";
import Image from "next/image";
import { GameCache, ResolvedChannel } from "@/types/database";
import { resolveBroadcastInfo } from "@/lib/broadcast";
import { format } from "date-fns";
import { ChevronDown, MapPin, Tv, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GameCardProps {
  game: GameCache;
  channelMappings?: Map<string, string>;
  userTimezone?: string;
  onChannelAdded?: (networkName: string, channelNumber: string) => void;
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

function ChannelPill({
  channel,
  onAddChannel,
}: {
  channel: ResolvedChannel;
  onAddChannel?: (networkName: string) => void;
}) {
  const isStreaming = channel.type === "streaming";

  if (isStreaming) {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-bg-secondary text-text-secondary">
        {channel.network_name}
      </span>
    );
  }

  if (channel.channel_number) {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs border border-accent/50 bg-accent-bg text-accent">
        {channel.network_name} Ch. {channel.channel_number}
      </span>
    );
  }

  // No channel number — show clickable pill to add one
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddChannel?.(channel.network_name);
      }}
      className="inline-flex items-center gap-1 rounded border border-dashed border-text-muted/40 px-2 py-0.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
      title={`Add channel number for ${channel.network_name}`}
    >
      {channel.network_name}
      <Plus className="h-3 w-3" />
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

  return (
    <div
      className={`cursor-pointer rounded-xl border transition-all ${
        expanded
          ? "border-accent shadow-card-lg"
          : "border-border shadow-card hover:border-border hover:shadow-card-lg"
      } bg-bg-card`}
      onClick={() => {
        if (!editingNetwork) setExpanded(!expanded);
      }}
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
                {game.away_team_logo ? (
                  <Image
                    src={game.away_team_logo}
                    alt={game.away_team_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {awayAbbr}
                  </div>
                )}
                <span className="text-xs text-text-muted">@</span>
                {game.home_team_logo ? (
                  <Image
                    src={game.home_team_logo}
                    alt={game.home_team_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {homeAbbr}
                  </div>
                )}
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
            <div className="flex items-center gap-3">
              {game.away_team_logo && (
                <Image
                  src={game.away_team_logo}
                  alt={game.away_team_name}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  unoptimized
                />
              )}
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
            </div>
            <span className="text-xs text-text-muted">at</span>
            <div className="flex items-center gap-3">
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
              {game.home_team_logo && (
                <Image
                  src={game.home_team_logo}
                  alt={game.home_team_name}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  unoptimized
                />
              )}
            </div>
          </div>

          {/* All broadcast options */}
          {channels.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Tv className="h-4 w-4 text-text-muted" />
              {channels.map((channel, i) => (
                <ChannelPill
                  key={i}
                  channel={channel}
                  onAddChannel={handleAddChannel}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Tv className="h-4 w-4" />
              Broadcast TBD
            </div>
          )}

          {/* Inline channel editor */}
          {editingNetwork && (
            <div
              className="mt-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-bg-card p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-text-secondary">
                Channel # for <strong className="text-accent">{editingNetwork}</strong>:
              </span>
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="e.g. 206"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveChannel();
                  if (e.key === "Escape") setEditingNetwork(null);
                }}
                className="w-20 rounded border border-border bg-bg-input px-2 py-1 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
              />
              <button
                onClick={handleSaveChannel}
                disabled={saving || !channelInput.trim()}
                className="rounded bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>
              <button
                onClick={() => setEditingNetwork(null)}
                className="text-xs text-text-muted hover:text-text-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
