import {
  ESPNScoreboardResponse,
  ESPNEvent,
  LeagueConfig,
} from "./types";
import { GameCache, GameStatus } from "@/types/database";

const ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports";

export const LEAGUE_CONFIGS: LeagueConfig[] = [
  { sport: "football", league: "nfl", leagueKey: "nfl", teamIdPrefix: "nfl" },
  {
    sport: "basketball",
    league: "nba",
    leagueKey: "nba",
    teamIdPrefix: "nba",
  },
  { sport: "baseball", league: "mlb", leagueKey: "mlb", teamIdPrefix: "mlb" },
  { sport: "hockey", league: "nhl", leagueKey: "nhl", teamIdPrefix: "nhl" },
  {
    sport: "soccer",
    league: "usa.1",
    leagueKey: "mls",
    teamIdPrefix: "mls",
  },
  {
    sport: "soccer",
    league: "eng.1",
    leagueKey: "epl",
    teamIdPrefix: "epl",
  },
  {
    sport: "soccer",
    league: "esp.1",
    leagueKey: "laliga",
    teamIdPrefix: "laliga",
  },
  {
    sport: "soccer",
    league: "uefa.champions",
    leagueKey: "ucl",
    teamIdPrefix: "ucl",
  },
  {
    sport: "football",
    league: "college-football",
    leagueKey: "ncaaf",
    teamIdPrefix: "ncaaf",
  },
  {
    sport: "basketball",
    league: "mens-college-basketball",
    leagueKey: "ncaam",
    teamIdPrefix: "ncaam",
  },
  {
    sport: "racing",
    league: "f1",
    leagueKey: "f1",
    teamIdPrefix: "f1",
  },
];

function mapESPNStatus(state: string, completed: boolean): GameStatus {
  if (completed) return "final";
  switch (state) {
    case "pre":
      return "scheduled";
    case "in":
      return "in_progress";
    case "post":
      return "final";
    default:
      return "scheduled";
  }
}

function extractBroadcastNetworks(
  event: ESPNEvent
): { networks: string[]; tv: string[]; streaming: string[] } {
  const networks: string[] = [];
  const tv: string[] = [];
  const streaming: string[] = [];
  const competition = event.competitions?.[0];
  if (!competition?.broadcasts) return { networks, tv, streaming };

  for (const broadcast of competition.broadcasts) {
    const isStreaming = broadcast.type?.shortName === "Web";
    for (const name of broadcast.names) {
      if (!networks.includes(name)) {
        networks.push(name);
        if (isStreaming) {
          streaming.push(name);
        } else {
          tv.push(name);
        }
      }
    }
  }
  return { networks, tv, streaming };
}

function eventToGameCache(
  event: ESPNEvent,
  leagueKey: string,
  teamIdPrefix: string
): Omit<GameCache, "id" | "fetched_at"> | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const homeTeam = competition.competitors.find((c) => c.homeAway === "home");
  const awayTeam = competition.competitors.find((c) => c.homeAway === "away");
  if (!homeTeam || !awayTeam) return null;

  const { networks, tv, streaming } = extractBroadcastNetworks(event);
  const roundInfo = competition.notes?.[0]?.headline || null;
  const status = mapESPNStatus(event.status.type.state, event.status.type.completed);

  const homeScoreRaw = homeTeam.score;
  const awayScoreRaw = awayTeam.score;
  const homeScore = homeScoreRaw !== undefined ? parseInt(homeScoreRaw, 10) : null;
  const awayScore = awayScoreRaw !== undefined ? parseInt(awayScoreRaw, 10) : null;

  return {
    external_id: `espn-${leagueKey}-${event.id}`,
    league: leagueKey,
    home_team_id: `${teamIdPrefix}-${homeTeam.team.abbreviation.toLowerCase()}`,
    home_team_name: homeTeam.team.displayName,
    away_team_id: `${teamIdPrefix}-${awayTeam.team.abbreviation.toLowerCase()}`,
    away_team_name: awayTeam.team.displayName,
    start_time: event.date,
    status,
    venue: competition.venue?.fullName || null,
    broadcast_info: networks.length > 0
      ? { networks, tv, streaming }
      : null,
    round_info: roundInfo,
    home_team_record: homeTeam.records?.[0]?.summary || null,
    away_team_record: awayTeam.records?.[0]?.summary || null,
    home_team_logo: homeTeam.team.logo || null,
    away_team_logo: awayTeam.team.logo || null,
    home_score: homeScore,
    away_score: awayScore,
  };
}

export async function fetchLeagueGames(
  config: LeagueConfig,
  date: string // YYYYMMDD format
): Promise<Omit<GameCache, "id" | "fetched_at">[]> {
  const url = `${ESPN_BASE_URL}/${config.sport}/${config.league}/scoreboard?dates=${date}`;

  const response = await fetch(url, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    console.error(
      `ESPN API error for ${config.leagueKey}: ${response.status}`
    );
    return [];
  }

  const data: ESPNScoreboardResponse = await response.json();
  const events = data.events || [];

  return events
    .map((event) =>
      eventToGameCache(event, config.leagueKey, config.teamIdPrefix)
    )
    .filter(
      (game): game is Omit<GameCache, "id" | "fetched_at"> => game !== null
    );
}

export async function fetchAllGames(
  date: string
): Promise<Omit<GameCache, "id" | "fetched_at">[]> {
  const results = await Promise.allSettled(
    LEAGUE_CONFIGS.map((config) => fetchLeagueGames(config, date))
  );

  const games: Omit<GameCache, "id" | "fetched_at">[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      games.push(...result.value);
    }
  }

  return games;
}
