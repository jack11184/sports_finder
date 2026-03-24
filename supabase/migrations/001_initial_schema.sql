-- Sports Finder Initial Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

create type view_mode as enum ('grid', 'list', 'timeline');
create type theme_mode as enum ('dark', 'light');
create type network_type as enum ('cable', 'streaming', 'broadcast');

-- ============================================
-- TABLES
-- ============================================

-- Teams reference table (populated from TheSportsDB)
create table teams (
  id text primary key,
  league text not null,
  name text not null,
  abbreviation text not null,
  logo_url text,
  updated_at timestamptz default now()
);

-- User profiles (extends Supabase auth.users)
create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  location text,
  timezone text,
  cable_provider_id uuid,
  preferred_view view_mode default 'grid',
  theme theme_mode default 'dark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User favorite teams
create table user_favorite_teams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  team_id text not null,
  league text not null,
  team_name text not null,
  created_at timestamptz default now(),
  unique (user_id, team_id)
);

-- Cable providers
create table cable_providers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- Add FK from user_profiles to cable_providers
alter table user_profiles
  add constraint fk_cable_provider
  foreign key (cable_provider_id) references cable_providers(id);

-- Cable channel mappings (regional)
create table cable_channel_mappings (
  id uuid primary key default uuid_generate_v4(),
  cable_provider_id uuid references cable_providers(id) on delete cascade not null,
  network_name text not null,
  channel_number text not null,
  region text,
  updated_at timestamptz default now(),
  unique (cable_provider_id, network_name, region)
);

-- Networks (cable, streaming, broadcast)
create table networks (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  type network_type not null,
  logo_url text
);

-- Broadcast mappings (league-level broadcast deals)
create table broadcast_mappings (
  id uuid primary key default uuid_generate_v4(),
  league text not null,
  network_id uuid references networks(id) on delete cascade not null,
  description text not null,
  day_of_week text,
  start_date date,
  end_date date,
  season_year integer not null,
  created_at timestamptz default now()
);

-- Games cache (populated by cron jobs)
create table games_cache (
  id uuid primary key default uuid_generate_v4(),
  external_id text unique not null,
  league text not null,
  home_team_id text,
  home_team_name text not null,
  away_team_id text,
  away_team_name text not null,
  start_time timestamptz not null,
  status text default 'scheduled',
  venue text,
  broadcast_info jsonb,
  round_info text,
  home_team_record text,
  away_team_record text,
  fetched_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_games_cache_league on games_cache(league);
create index idx_games_cache_start_time on games_cache(start_time);
create index idx_games_cache_status on games_cache(status);
create index idx_user_favorite_teams_user on user_favorite_teams(user_id);
create index idx_cable_channel_provider on cable_channel_mappings(cable_provider_id);
create index idx_teams_league on teams(league);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table user_profiles enable row level security;
alter table user_favorite_teams enable row level security;
alter table cable_providers enable row level security;
alter table cable_channel_mappings enable row level security;
alter table networks enable row level security;
alter table broadcast_mappings enable row level security;
alter table games_cache enable row level security;
alter table teams enable row level security;

-- User profiles: users can only access their own
create policy "Users can view own profile"
  on user_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile"
  on user_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = user_id);

-- User favorite teams: users can only access their own
create policy "Users can view own favorites"
  on user_favorite_teams for select using (auth.uid() = user_id);
create policy "Users can insert own favorites"
  on user_favorite_teams for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites"
  on user_favorite_teams for delete using (auth.uid() = user_id);

-- Read-only tables: all authenticated users can read
create policy "Authenticated users can view cable providers"
  on cable_providers for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view channel mappings"
  on cable_channel_mappings for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view networks"
  on networks for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view broadcast mappings"
  on broadcast_mappings for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view games"
  on games_cache for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view teams"
  on teams for select using (auth.role() = 'authenticated');

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
