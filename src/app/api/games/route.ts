import { NextRequest, NextResponse } from "next/server";
import { fetchAllGames } from "@/lib/api/espn";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");

  // Default to today if no date provided
  const date = dateParam || format(new Date(), "yyyyMMdd");

  const supabase = await createClient();

  // Check if we have cached games for this date
  const dateStart = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00Z`;
  const dateEnd = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T23:59:59Z`;

  const { data: cachedGames } = await supabase
    .from("games_cache")
    .select("*")
    .gte("start_time", dateStart)
    .lte("start_time", dateEnd)
    .order("start_time", { ascending: true });

  // If we have recent cached data (less than 30 min old), return it
  if (cachedGames && cachedGames.length > 0) {
    const oldestFetch = new Date(
      Math.min(...cachedGames.map((g) => new Date(g.fetched_at).getTime()))
    );
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    if (oldestFetch > thirtyMinAgo) {
      return NextResponse.json({ games: cachedGames, source: "cache" });
    }
  }

  // Fetch fresh data from ESPN
  try {
    const games = await fetchAllGames(date);

    if (games.length > 0) {
      // Upsert games into cache
      const { error: upsertError } = await supabase.from("games_cache").upsert(
        games.map((game) => ({
          ...game,
          fetched_at: new Date().toISOString(),
        })),
        { onConflict: "external_id" }
      );

      if (upsertError) {
        console.error("Error upserting games:", upsertError);
      }

      // Clean up old games
      await supabase
        .from("games_cache")
        .delete()
        .lt(
          "start_time",
          new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        );
    }

    // Re-fetch from cache to get consistent data with IDs
    const { data: freshGames } = await supabase
      .from("games_cache")
      .select("*")
      .gte("start_time", dateStart)
      .lte("start_time", dateEnd)
      .order("start_time", { ascending: true });

    return NextResponse.json({
      games: freshGames || games,
      source: "fresh",
    });
  } catch (error) {
    console.error("Error fetching games:", error);

    // Fall back to cached data even if stale
    if (cachedGames && cachedGames.length > 0) {
      return NextResponse.json({ games: cachedGames, source: "stale-cache" });
    }

    return NextResponse.json({ games: [], source: "error" });
  }
}
