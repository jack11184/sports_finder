export interface ESPNScoreboardResponse {
  leagues?: ESPNLeague[];
  events?: ESPNEvent[];
}

export interface ESPNLeague {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: {
      id: string;
      name: string;
      state: string; // "pre", "in", "post"
      completed: boolean;
    };
  };
  competitions: ESPNCompetition[];
}

export interface ESPNCompetition {
  id: string;
  venue?: {
    fullName: string;
    city: string;
    state: string;
  };
  competitors: ESPNCompetitor[];
  broadcasts?: ESPNBroadcast[];
  notes?: { headline: string }[];
}

export interface ESPNCompetitor {
  id: string;
  homeAway: "home" | "away";
  score?: string; // present for in-progress and final games
  team: {
    id: string;
    name: string;
    abbreviation: string;
    displayName: string;
    logo?: string;
  };
  records?: { summary: string }[];
}

export interface ESPNBroadcast {
  names: string[];
  type: {
    shortName: string; // "TV", "Web", etc.
  };
}

export interface LeagueConfig {
  sport: string;
  league: string;
  leagueKey: string; // our internal key like "nfl", "epl"
  teamIdPrefix: string;
}
