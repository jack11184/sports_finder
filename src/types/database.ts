export type ViewMode = "grid" | "list" | "timeline";
export type ThemeMode = "dark" | "light";
export type NetworkType = "cable" | "streaming" | "broadcast";
export type GameStatus =
  | "scheduled"
  | "in_progress"
  | "final"
  | "postponed"
  | "cancelled";

export interface UserProfile {
  id: string;
  user_id: string;
  location: string | null;
  timezone: string | null;
  cable_provider_id: string | null;
  preferred_view: ViewMode;
  theme: ThemeMode;
  created_at: string;
  updated_at: string;
}

export interface UserFavoriteTeam {
  id: string;
  user_id: string;
  team_id: string;
  league: string;
  team_name: string;
  created_at: string;
}

export interface Team {
  id: string;
  league: string;
  name: string;
  abbreviation: string;
  logo_url: string | null;
  updated_at: string;
}

export interface CableProvider {
  id: string;
  name: string;
  created_at: string;
}

export interface CableChannelMapping {
  id: string;
  cable_provider_id: string;
  network_name: string;
  channel_number: string;
  region: string | null;
  updated_at: string;
}

export interface UserChannelMapping {
  id: string;
  user_id: string;
  network_name: string;
  channel_number: string;
  updated_at: string;
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  logo_url: string | null;
}

export interface BroadcastMapping {
  id: string;
  league: string;
  network_id: string;
  description: string;
  day_of_week: string | null;
  start_date: string | null;
  end_date: string | null;
  season_year: number;
  created_at: string;
}

export interface GameCache {
  id: string;
  external_id: string;
  league: string;
  home_team_id: string;
  home_team_name: string;
  away_team_id: string;
  away_team_name: string;
  start_time: string;
  status: GameStatus;
  venue: string | null;
  broadcast_info: BroadcastInfo | null;
  round_info: string | null;
  home_team_record: string | null;
  away_team_record: string | null;
  home_team_logo: string | null;
  away_team_logo: string | null;
  fetched_at: string;
  /** Present when scoreboard includes live/final scores */
  home_score?: number | null;
  away_score?: number | null;
}

export interface BroadcastInfo {
  networks?: string[];
  [key: string]: unknown;
}

// Joined game data for the frontend
export interface GameWithDetails extends GameCache {
  home_team?: Team;
  away_team?: Team;
  resolved_channels?: ResolvedChannel[];
}

export interface ResolvedChannel {
  network_name: string;
  type: NetworkType;
  channel_number?: string;
}
