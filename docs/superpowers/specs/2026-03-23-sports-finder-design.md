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

- **ESPN unofficial API** (primary) — covers most US and international leagues. Endpoint pattern: `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard`. Includes broadcast info in responses.
- **TheSportsDB** — team metadata (names, logos, abbreviations). Free tier, 100 req/min limit.
- **API-Football** (free tier) — international soccer supplement. 100 req/day free.

### Data Refresh Strategy

- Cron job runs every 30 minutes via Supabase Edge Function
- Fetches games for today + next 7 days across all supported leagues
- Stores in `games_cache` table with `fetched_at` timestamp
- Frontend reads from cache only — never hits external APIs directly

### Broadcast Data Layering

1. **Primary:** Broadcast info from ESPN API response (often includes network name)
2. **Fallback:** Match against `broadcast_mappings` table (league-level deals, e.g., "Sunday Night Football = NBC")
3. **Streaming:** Curated `broadcast_mappings` entries for streaming exclusives (Peacock, ESPN+, Apple TV+, Amazon Prime)

### Cable Channel Resolution

User's cable provider + network name → lookup `cable_channel_mappings` → display channel number.
Example: User on Xfinity, game on ESPN → "ESPN (Ch. 206)"

Cable channel data sourced from:
- Static database for major providers (Xfinity, Spectrum, DirecTV, DISH, etc.)
- Scraping provider lineup pages to keep data updated

## Database Schema

### Tables

**user_profiles**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users, unique)
- `location` (text — ZIP code or city)
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

**cable_providers**
- `id` (uuid, PK)
- `name` (text — e.g., "Xfinity", "Spectrum")
- `region` (text, nullable — for regional variations)
- `created_at` (timestamptz)

**cable_channel_mappings**
- `id` (uuid, PK)
- `cable_provider_id` (uuid, FK → cable_providers)
- `network_name` (text — e.g., "ESPN", "FOX", "CBS")
- `channel_number` (text — text to support "206/1206" HD variants)
- `updated_at` (timestamptz)
- Unique constraint on (cable_provider_id, network_name)

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
- `season_year` (integer)
- `created_at` (timestamptz)

**games_cache**
- `id` (uuid, PK)
- `external_id` (text, unique — ID from source API)
- `league` (text)
- `home_team_id` (text)
- `home_team_name` (text)
- `away_team_id` (text)
- `away_team_name` (text)
- `start_time` (timestamptz)
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
Email/password login form. Link to signup.

### `/signup` — Sign Up
Email/password registration. Redirects to onboarding on success.

### `/onboarding` — Setup Wizard (3 steps)
Step-by-step wizard, each step skippable:

1. **Location** — ZIP code input or "Use my location" (browser geolocation → reverse geocode to ZIP)
2. **Cable Provider** — Dropdown of major providers, searchable. Option for "I don't have cable" / "Streaming only"
3. **Favorite Teams** — Search/browse by league. Select multiple teams. Shows team logos.

After completion (or skip all), redirect to `/games`.

### `/games` — Main Schedule View (core page)
- **Date picker** — horizontal scrollable day selector, defaults to today
- **View mode toggle** — grid / list / timeline (saved to profile)
- **League filter** — pills to filter by league, "Favorites" filter, "All" default
- **Game cards** — compact by default, expandable on click

**Compact card shows:** league badge, team names/abbreviations, start time, primary cable channel (with number if user has provider set), primary streaming platform

**Expanded card adds:** full team names, records, venue, round/matchup info, all broadcast options as pills (cable channels with numbers, streaming platforms)

**No favorites set:** show all games, with a subtle banner suggesting "Add favorite teams to filter"

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
- Team logos (small circles) + abbreviated names
- Start time
- Cable channel with number (if user has provider) + streaming platform
- League indicator

**Expanded state (on click):**
- Full team names
- Team records and standings position
- Venue name
- League round/matchup context
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

## Phase 2 (Future)

- Live scores and game status (in-progress indicators)
- Push notifications for favorite team games starting soon
- "What's on right now" quick filter
- User-submitted channel number corrections
- Mobile app (React Native, shared logic)
