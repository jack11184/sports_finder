-- Add score columns and team logo columns to games_cache
-- home_team_logo/away_team_logo may already exist if added via dashboard

alter table games_cache
  add column if not exists home_team_logo text,
  add column if not exists away_team_logo text,
  add column if not exists home_score integer,
  add column if not exists away_score integer;
