import { NextRequest, NextResponse } from "next/server";
import { fetchAllGames } from "@/lib/api/espn";
import { createAdminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");
  const tzOffset = searchParams.get("tz") || "-300"; // default to EST (-5h = -300min)

  // Default to today if no date provided
  const date = dateParam || format(new Date(), "yyyyMMdd");

  // Use admin client to bypass RLS for reading/writing shared cache
  const supabase = createAdminClient();

  // Build date range in the user's local timezone
  // tzOffset is in minutes (e.g., -300 for EST, -420 for PST)
  const offsetMs = parseInt(tzOffset) * 60 * 1000;
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4, 6)) - 1;
  const day = parseInt(date.slice(6, 8));

  // Create start/end of the selected day in the user's timezone, converted to UTC
  const localStart = new Date(year, month, day, 0, 0, 0);
  const localEnd = new Date(year, month, day, 23, 59, 59);
  const dateStart = new Date(localStart.getTime() - offsetMs).toISOString();
  const dateEnd = new Date(localEnd.getTime() - offsetMs).toISOString();

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
