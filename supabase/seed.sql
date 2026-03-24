-- ============================================
-- CABLE PROVIDERS
-- ============================================

insert into cable_providers (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Xfinity'),
  ('00000000-0000-0000-0000-000000000002', 'Spectrum'),
  ('00000000-0000-0000-0000-000000000003', 'DirecTV'),
  ('00000000-0000-0000-0000-000000000004', 'DISH Network'),
  ('00000000-0000-0000-0000-000000000005', 'Cox'),
  ('00000000-0000-0000-0000-000000000006', 'Optimum'),
  ('00000000-0000-0000-0000-000000000007', 'YouTube TV'),
  ('00000000-0000-0000-0000-000000000008', 'Hulu + Live TV'),
  ('00000000-0000-0000-0000-000000000009', 'FuboTV'),
  ('00000000-0000-0000-0000-000000000010', 'Sling TV');

-- ============================================
-- NETWORKS
-- ============================================

insert into networks (name, type) values
  -- Broadcast
  ('ABC', 'broadcast'),
  ('CBS', 'broadcast'),
  ('FOX', 'broadcast'),
  ('NBC', 'broadcast'),
  -- Cable
  ('ESPN', 'cable'),
  ('ESPN2', 'cable'),
  ('FS1', 'cable'),
  ('FS2', 'cable'),
  ('TNT', 'cable'),
  ('TBS', 'cable'),
  ('NFL Network', 'cable'),
  ('MLB Network', 'cable'),
  ('NBA TV', 'cable'),
  ('NHL Network', 'cable'),
  ('ESPNU', 'cable'),
  ('SEC Network', 'cable'),
  ('Big Ten Network', 'cable'),
  ('ACC Network', 'cable'),
  ('USA Network', 'cable'),
  -- Streaming
  ('ESPN+', 'streaming'),
  ('Peacock', 'streaming'),
  ('Paramount+', 'streaming'),
  ('Amazon Prime Video', 'streaming'),
  ('Apple TV+', 'streaming'),
  ('Netflix', 'streaming'),
  ('MLB.TV', 'streaming'),
  ('DAZN', 'streaming'),
  ('F1 TV', 'streaming');

-- ============================================
-- CABLE CHANNEL MAPPINGS (Xfinity - nationwide defaults)
-- ============================================

insert into cable_channel_mappings (cable_provider_id, network_name, channel_number, region) values
  -- Xfinity
  ('00000000-0000-0000-0000-000000000001', 'ESPN', '206', null),
  ('00000000-0000-0000-0000-000000000001', 'ESPN2', '209', null),
  ('00000000-0000-0000-0000-000000000001', 'FS1', '219', null),
  ('00000000-0000-0000-0000-000000000001', 'NFL Network', '226', null),
  ('00000000-0000-0000-0000-000000000001', 'MLB Network', '234', null),
  ('00000000-0000-0000-0000-000000000001', 'NBA TV', '235', null),
  ('00000000-0000-0000-0000-000000000001', 'TNT', '217', null),
  ('00000000-0000-0000-0000-000000000001', 'TBS', '252', null),
  ('00000000-0000-0000-0000-000000000001', 'ABC', '6', null),
  ('00000000-0000-0000-0000-000000000001', 'CBS', '3', null),
  ('00000000-0000-0000-0000-000000000001', 'FOX', '12', null),
  ('00000000-0000-0000-0000-000000000001', 'NBC', '10', null),
  ('00000000-0000-0000-0000-000000000001', 'USA Network', '242', null),
  -- Spectrum
  ('00000000-0000-0000-0000-000000000002', 'ESPN', '206', null),
  ('00000000-0000-0000-0000-000000000002', 'ESPN2', '209', null),
  ('00000000-0000-0000-0000-000000000002', 'FS1', '219', null),
  ('00000000-0000-0000-0000-000000000002', 'NFL Network', '226', null),
  ('00000000-0000-0000-0000-000000000002', 'TNT', '245', null),
  ('00000000-0000-0000-0000-000000000002', 'TBS', '247', null),
  ('00000000-0000-0000-0000-000000000002', 'ABC', '7', null),
  ('00000000-0000-0000-0000-000000000002', 'CBS', '2', null),
  ('00000000-0000-0000-0000-000000000002', 'FOX', '11', null),
  ('00000000-0000-0000-0000-000000000002', 'NBC', '4', null),
  -- DirecTV
  ('00000000-0000-0000-0000-000000000003', 'ESPN', '206', null),
  ('00000000-0000-0000-0000-000000000003', 'ESPN2', '209', null),
  ('00000000-0000-0000-0000-000000000003', 'FS1', '219', null),
  ('00000000-0000-0000-0000-000000000003', 'NFL Network', '212', null),
  ('00000000-0000-0000-0000-000000000003', 'TNT', '245', null),
  ('00000000-0000-0000-0000-000000000003', 'TBS', '247', null),
  ('00000000-0000-0000-0000-000000000003', 'MLB Network', '213', null),
  ('00000000-0000-0000-0000-000000000003', 'NBA TV', '216', null);

-- ============================================
-- TEAMS (major teams across leagues - sample set)
-- ============================================

insert into teams (id, league, name, abbreviation, logo_url) values
  -- NFL
  ('nfl-kc', 'nfl', 'Kansas City Chiefs', 'KC', null),
  ('nfl-buf', 'nfl', 'Buffalo Bills', 'BUF', null),
  ('nfl-phi', 'nfl', 'Philadelphia Eagles', 'PHI', null),
  ('nfl-dal', 'nfl', 'Dallas Cowboys', 'DAL', null),
  ('nfl-sf', 'nfl', 'San Francisco 49ers', 'SF', null),
  ('nfl-det', 'nfl', 'Detroit Lions', 'DET', null),
  ('nfl-bal', 'nfl', 'Baltimore Ravens', 'BAL', null),
  ('nfl-mia', 'nfl', 'Miami Dolphins', 'MIA', null),
  ('nfl-nyj', 'nfl', 'New York Jets', 'NYJ', null),
  ('nfl-nyg', 'nfl', 'New York Giants', 'NYG', null),
  ('nfl-ne', 'nfl', 'New England Patriots', 'NE', null),
  ('nfl-pit', 'nfl', 'Pittsburgh Steelers', 'PIT', null),
  ('nfl-cin', 'nfl', 'Cincinnati Bengals', 'CIN', null),
  ('nfl-cle', 'nfl', 'Cleveland Browns', 'CLE', null),
  ('nfl-hou', 'nfl', 'Houston Texans', 'HOU', null),
  ('nfl-ind', 'nfl', 'Indianapolis Colts', 'IND', null),
  ('nfl-jax', 'nfl', 'Jacksonville Jaguars', 'JAX', null),
  ('nfl-ten', 'nfl', 'Tennessee Titans', 'TEN', null),
  ('nfl-den', 'nfl', 'Denver Broncos', 'DEN', null),
  ('nfl-lac', 'nfl', 'Los Angeles Chargers', 'LAC', null),
  ('nfl-lv', 'nfl', 'Las Vegas Raiders', 'LV', null),
  ('nfl-sea', 'nfl', 'Seattle Seahawks', 'SEA', null),
  ('nfl-ari', 'nfl', 'Arizona Cardinals', 'ARI', null),
  ('nfl-lar', 'nfl', 'Los Angeles Rams', 'LAR', null),
  ('nfl-gb', 'nfl', 'Green Bay Packers', 'GB', null),
  ('nfl-min', 'nfl', 'Minnesota Vikings', 'MIN', null),
  ('nfl-chi', 'nfl', 'Chicago Bears', 'CHI', null),
  ('nfl-tb', 'nfl', 'Tampa Bay Buccaneers', 'TB', null),
  ('nfl-no', 'nfl', 'New Orleans Saints', 'NO', null),
  ('nfl-atl', 'nfl', 'Atlanta Falcons', 'ATL', null),
  ('nfl-car', 'nfl', 'Carolina Panthers', 'CAR', null),
  ('nfl-wsh', 'nfl', 'Washington Commanders', 'WSH', null),
  -- NBA
  ('nba-lal', 'nba', 'Los Angeles Lakers', 'LAL', null),
  ('nba-bos', 'nba', 'Boston Celtics', 'BOS', null),
  ('nba-gsw', 'nba', 'Golden State Warriors', 'GSW', null),
  ('nba-mil', 'nba', 'Milwaukee Bucks', 'MIL', null),
  ('nba-den', 'nba', 'Denver Nuggets', 'DEN', null),
  ('nba-phi', 'nba', 'Philadelphia 76ers', 'PHI', null),
  ('nba-nyk', 'nba', 'New York Knicks', 'NYK', null),
  ('nba-bkn', 'nba', 'Brooklyn Nets', 'BKN', null),
  ('nba-mia', 'nba', 'Miami Heat', 'MIA', null),
  ('nba-dal', 'nba', 'Dallas Mavericks', 'DAL', null),
  ('nba-phx', 'nba', 'Phoenix Suns', 'PHX', null),
  ('nba-okc', 'nba', 'Oklahoma City Thunder', 'OKC', null),
  -- MLB
  ('mlb-nyy', 'mlb', 'New York Yankees', 'NYY', null),
  ('mlb-bos', 'mlb', 'Boston Red Sox', 'BOS', null),
  ('mlb-lad', 'mlb', 'Los Angeles Dodgers', 'LAD', null),
  ('mlb-hou', 'mlb', 'Houston Astros', 'HOU', null),
  ('mlb-atl', 'mlb', 'Atlanta Braves', 'ATL', null),
  ('mlb-chc', 'mlb', 'Chicago Cubs', 'CHC', null),
  ('mlb-nym', 'mlb', 'New York Mets', 'NYM', null),
  ('mlb-phi', 'mlb', 'Philadelphia Phillies', 'PHI', null),
  ('mlb-sf', 'mlb', 'San Francisco Giants', 'SF', null),
  ('mlb-stl', 'mlb', 'St. Louis Cardinals', 'STL', null),
  -- NHL
  ('nhl-nyr', 'nhl', 'New York Rangers', 'NYR', null),
  ('nhl-bos', 'nhl', 'Boston Bruins', 'BOS', null),
  ('nhl-tor', 'nhl', 'Toronto Maple Leafs', 'TOR', null),
  ('nhl-edm', 'nhl', 'Edmonton Oilers', 'EDM', null),
  ('nhl-col', 'nhl', 'Colorado Avalanche', 'COL', null),
  ('nhl-fla', 'nhl', 'Florida Panthers', 'FLA', null),
  -- EPL
  ('epl-ars', 'epl', 'Arsenal', 'ARS', null),
  ('epl-mci', 'epl', 'Manchester City', 'MCI', null),
  ('epl-liv', 'epl', 'Liverpool', 'LIV', null),
  ('epl-mun', 'epl', 'Manchester United', 'MUN', null),
  ('epl-che', 'epl', 'Chelsea', 'CHE', null),
  ('epl-tot', 'epl', 'Tottenham Hotspur', 'TOT', null),
  -- La Liga
  ('laliga-rma', 'laliga', 'Real Madrid', 'RMA', null),
  ('laliga-fcb', 'laliga', 'FC Barcelona', 'FCB', null),
  ('laliga-atm', 'laliga', 'Atletico Madrid', 'ATM', null);
