import { BroadcastInfo, ResolvedChannel, NetworkType } from "@/types/database";

// Known streaming platforms
const STREAMING_PLATFORMS = new Set([
  "ESPN+",
  "Peacock",
  "Paramount+",
  "Amazon Prime Video",
  "Prime Video",
  "Apple TV+",
  "Apple TV",
  "Netflix",
  "MLB.TV",
  "DAZN",
  "F1 TV",
  "Hulu",
  "fuboTV",
  "NBA League Pass",
  "NESN 360",
  "HBO Max",
  // Team streaming services
  "BlazerVision",
  "BravesVision",
  "Brewers.TV",
  "Cardinals.TV",
  "CLEGuardians.TV",
  "DBACKS.TV",
  "Jazz+",
  "Mariners.TV",
  "Marlins.TV",
  "Nationals.TV",
  "Padres.TV",
  "Rays.TV",
  "Reds.TV",
  "Rockies.TV",
  "Royals.TV",
  "Tigers.TV",
  "Twins.TV",
  "Victory+",
  "Mavs.com",
  "Pelicans.com",
  "CHSN+",
  "Spectrum Sports Net +",
]);

// Known broadcast networks
const BROADCAST_NETWORKS = new Set([
  "ABC",
  "CBS",
  "FOX",
  "NBC",
]);

function getNetworkType(name: string): NetworkType {
  if (STREAMING_PLATFORMS.has(name)) return "streaming";
  if (BROADCAST_NETWORKS.has(name)) return "broadcast";
  // Everything else is cable (RSNs, ESPN, TNT, etc.)
  return "cable";
}

export function resolveBroadcastInfo(
  broadcastInfo: BroadcastInfo | null,
  channelMappings?: Map<string, string> // network_name -> channel_number
): ResolvedChannel[] {
  if (!broadcastInfo?.networks?.length) return [];

  return broadcastInfo.networks.map((networkName) => {
    const type = getNetworkType(networkName);
    const channelNumber =
      type !== "streaming" ? channelMappings?.get(networkName) : undefined;

    return {
      network_name: networkName,
      type,
      channel_number: channelNumber,
    };
  });
}
