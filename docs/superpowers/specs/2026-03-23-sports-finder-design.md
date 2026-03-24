# Sports Finder — Design Spec

## Overview

A web application where users set their location, cable provider, and favorite sports teams, then see a personalized daily schedule of games with channel numbers and streaming platform availability.

## Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API routes + Server Components
- **Database & Auth:** Supabase (PostgreSQL, Auth with email/password)
- **Background Jobs:** Supabase Edge Functions (cron-based data refresh)
- **Hosting:** Railway

## Supported Leagues

US major leagues (NFL, NBA, MLB, NHL, MLS), NCAA football & basketball, Premier League, La Liga, Champions League, F1. Architecture supports adding more leagues over time.

## Data Sources

### Sports Schedule APIs (free tier)

- **ESPN unofficial API** (primary) — covers most US and international leagues. Endpoint pattern: `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard`. Includes broadcast info in responses. **Risk:** unofficial endpoint with no stability guarantee. Mitigation: monitor for breakage, keep API integration behind an adapter layer so data sources can be swapped. Secondary fallback for US leagues: TheSportsDB schedule endpoints.
- **TheSportsDB** — team metadata (names, logos, abbreviations) and secondary schedule data. Free tier, 100 req/min limit.
- **API-Football** (free tier) — international soccer supplement. 100 req/day free. **Rate limit strategy:** fetch soccer fixtures once every 6 hours (4 requests/league/day × 4 leagues = 16 req/day), not every 30 minutes. Results cached in `games_cache` like everything else.

### Data Refresh Strategy

- **Primary cron job** runs every 30 minutes via Supabase Edge Function for ESPN-sourced leagues
- **Soccer cron job** runs every 6 hours for API-Football-sourced leagues (to stay within 100 req/day)
- Fetches games for today + next 7 days across all supported leagues
- Stores in `games_cache` table with `fetched_at` timestamp
- **Upsert strategy:** on conflict with `external_id`, update `start_time`, `broadcast_info`, `status`, `home_team_record`, `away_team_record`, `round_info`, `venue`, and `fetched_at`. This handles rescheduled games and updated broadcast info.
- **Cleanup:** each cron run deletes rows where `start_time < now() - interval '2 days'` to prevent stale data accumulation
- Frontend reads from cache only — never hits external APIs directly

### Broadcast Data Layering

1. **Primary:** Broadcast info from ESPN API response (often includes network name)
2. **Fallback:** Match against `broadcast_mappings` table (league-level deals, e.g., "Sunday Night Football = NBC"). This table is a coarse fallback — the ESPN API broadcast field is authoritative when available.
3. **Streaming:** Curated `broadcast_mappings` entries for streaming exclusives (Peacock, ESPN+, Apple TV+, Amazon Prime)

### Cable Channel Resolution

User's cable provider + region (derived from ZIP code) + network name → lookup `cable_channel_mappings` → display channel number.
Example: User on Xfinity in San Francisco, game on ESPN → "ESPN (Ch. 206)"

Cable channel data sourced from:
- Static database for major providers (Xfinity, Spectrum, DirecTV, DISH, etc.) with regional variations
- Manual updates as needed. Web scraping of provider lineup pages is deferred — too fragile and may violate ToS. For MVP, static data with a manual update process is sufficient.

### Location Purpose

The user's ZIP code serves three functions:
1. **Timezone:** display game times in the user's local timezone
2. **Cable provider region:** resolve the correct regional channel lineup (e.g., Xfinity San Francisco vs Xfinity Chicago have different channel numbers)
3. **Regional sports networks:** determine which RSNs are available (e.g., YES Network for New York area users) — used when matching broadcast info to the user's available channels

## Database Schema

Row Level Security (RLS) is enabled on all user-data tables. `user_profiles` and `user_favorite_teams` have policies scoped to `auth.uid() = user_id` for all operations. Read-only tables (`cable_providers`, `cable_channel_mappings`, `networks`, `broadcast_mappings`, `games_cache`, `teams`) are readable by all authenticated users.

### Tables

**user_profiles**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users, unique)
- `location` (text — ZIP code)
- `timezone` (text, nullable — derived from ZIP, e.g., "America/New_York")
- `cable_provider_id` (uuid, FK → cable_providers, nullable)
- `preferred_view` (enum: grid | list | timeline, default: grid)
- `theme` (enum: dark | light, default: dark)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**user_favorite_teams**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `team_id` (text — external team identifier)
- `league` (text)
- `team_name` (text)
- `created_at` (timestamptz)
- Unique constraint on (user_id, team_id)

**teams**
- `id` (text, PK — external team identifier matching API source)
- `league` (text)
- `name` (text — full name, e.g., "Kansas City Chiefs")
- `abbreviation` (text — e.g., "KC")
- `logo_url` (text, nullable)
- `updated_at` (timestamptz)

**cable_providers**
- `id` (uuid, PK)
- `name` (text — e.g., "Xfinity", "Spectrum")
- `created_at` (timestamptz)

**cable_channel_mappings**
- `id` (uuid, PK)
- `cable_provider_id` (uuid, FK → cable_providers)
- `network_name` (text — e.g., "ESPN", "FOX", "CBS")
- `channel_number` (text — text to support "206/1206" HD variants)
- `region` (text, nullable — ZIP prefix or metro area, nullable means nationwide)
- `updated_at` (timestamptz)
- Unique constraint on (cable_provider_id, network_name, region)

**networks**
- `id` (uuid, PK)
- `name` (text, unique)
- `type` (enum: cable | streaming | broadcast)
- `logo_url` (text, nullable)

**broadcast_mappings**
- `id` (uuid, PK)
- `league` (text)
- `network_id` (uuid, FK → networks)
- `description` (text — e.g., "Thursday Night Football")
- `day_of_week` (text, nullable — for recurring schedules)
- `start_date` (date, nullable — when this mapping takes effect)
- `end_date` (date, nullable — when this mapping expires)
- `season_year` (integer)
- `created_at` (timestamptz)

**games_cache**
- `id` (uuid, PK)
- `external_id` (text, unique — ID from source API)
- `league` (text)
- `home_team_id` (text, FK → teams)
- `home_team_name` (text)
- `away_team_id` (text, FK → teams)
- `away_team_name` (text)
- `start_time` (timestamptz)
- `status` (text — "scheduled", "in_progress", "final", "postponed", "cancelled")
- `venue` (text, nullable)
- `broadcast_info` (jsonb — raw broadcast data from API)
- `round_info` (text, nullable — e.g., "Week 15", "AFC Divisional")
- `home_team_record` (text, nullable)
- `away_team_record` (text, nullable)
- `fetched_at` (timestamptz)

## Pages & Routes

### `/` — Landing Page
Marketing/intro page explaining the app. CTA to sign up.

### `/login` — Login
Email/password login form. Link to signup and forgot password.

### `/signup` — Sign Up
Email/password registration. Redirects to onboarding on success.

### `/forgot-password` — Password Reset
Email input form. Uses Supabase's built-in password reset email flow. User receives email with reset link → Supabase handles the token → redirects to `/reset-password` page where they set a new password.

### `/reset-password` — Set New Password
New password form. Accessed via Supabase reset token in URL.

### `/onboarding` — Setup Wizard (3 steps)
Step-by-step wizard, each step skippable:

1. **Location** — ZIP code input or "Use my location" (browser geolocation → reverse geocode to ZIP). Derives timezone automatically.
2. **Cable Provider** — Dropdown of major providers, filtered by region if location is set. Option for "I don't have cable" / "Streaming only"
3. **Favorite Teams** — Search/browse by league. Select multiple teams. Shows team logos from `teams` table.

After completion (or skip all), redirect to `/games`.

### `/games` — Main Schedule View (core page)
- **Date picker** — horizontal scrollable day selector, defaults to today
- **View mode toggle** — grid / list / timeline (saved to profile)
- **League filter** — pills to filter by league, "Favorites" filter, "All" default
- **Game cards** — compact by default, expandable on click

**Compact card shows:** league badge, team logos + abbreviated names (from `teams` table), start time (in user's timezone), primary cable channel (with number if user has provider set), primary streaming platform

**Expanded card adds:** full team names, records, venue, round/matchup info, all broadcast options as pills (cable channels with numbers, streaming platforms), game status badge

**No favorites set:** show all games, with a subtle banner suggesting "Add favorite teams to filter"

**Empty/error states:**
- **No games on selected date:** "No games scheduled for [date]" with suggestion to browse another day
- **Stale/empty cache:** "Game data is temporarily unavailable. Please check back shortly." (shown when `games_cache` has no recent rows or `fetched_at` is older than 2 hours)
- **No broadcast info for a game:** show "Broadcast TBD" instead of leaving it blank

### `/settings` — User Settings
- Update location
- Change cable provider
- Manage favorite teams (add/remove)
- View mode preference
- Theme toggle (dark/light)
- Account management (change password, delete account)

## UI Design

### View Modes

All three views display the same data, differently arranged:

1. **Card Grid** — responsive grid of game cards. League filter pills at top.
2. **Grouped List** — vertical list grouped by league headers. Date picker prominent.
3. **Timeline** — chronological by start time, games clustered under time markers. Mixed leagues.

### Theme

- **Dark mode** (default): dark navy/charcoal backgrounds (#1a1a2e, #16213e), white text, accent color for highlights
- **Light mode:** white/light gray backgrounds, dark text, same accent color
- Toggle saved to user profile, respects system preference as initial default

### Game Cards — Compact + Expandable

**Compact state:**
- Team logos (small circles, from `teams.logo_url`) + abbreviated names (from `teams.abbreviation`)
- Start time (in user's local timezone)
- Cable channel with number (if user has provider) + streaming platform
- League indicator

**Expanded state (on click):**
- Full team names
- Team records and standings position
- Venue name
- League round/matchup context
- Game status badge (scheduled / in progress / final)
- All broadcast options as styled pills (cable with channel numbers, streaming, broadcast)

## Key User Flows

### First Visit
1. Land on `/` → click "Sign Up"
2. Create account (email/password)
3. Onboarding wizard: set location → cable provider → favorite teams
4. Arrive at `/games` with personalized view

### Daily Use
1. Open `/games` (defaults to today)
2. See favorite teams' games highlighted/filtered
3. Check what channel/stream each game is on
4. Optionally browse other dates via date picker

### Settings Update
1. Go to `/settings`
2. Change cable provider (e.g., switched from Xfinity to YouTube TV)
3. Channel numbers update across all game cards

### Password Reset
1. Click "Forgot password?" on `/login`
2. Enter email on `/forgot-password`
3. Receive Supabase reset email
4. Click link → set new password on `/reset-password`

## Phase 2 (Future)

- Live scores and game status updates (real-time in-progress indicators)
- Push notifications for favorite team games starting soon
- "What's on right now" quick filter
- User-submitted channel number corrections
- Web scraping of cable provider lineup pages for automated channel updates
- Mobile app (React Native, shared logic)
