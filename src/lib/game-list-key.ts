import type { GameCache } from "@/types/database";

/**
 * Stable unique key for list reconciliation. Avoids duplicate `id` / `external_id`
 * edge cases that can tie two cards to one component instance (shared open state).
 */
export function gameListKey(game: GameCache): string {
  return [
    game.id ?? "",
    game.external_id ?? "",
    game.start_time ?? "",
    game.league ?? "",
    game.home_team_id ?? "",
    game.away_team_id ?? "",
  ].join("::");
}
