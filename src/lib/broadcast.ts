import { BroadcastInfo, ResolvedChannel, NetworkType } from "@/types/database";

// Known streaming platforms
const STREAMING_PLATFORMS: Record<string, NetworkType> = {
  "ESPN+": "streaming",
  Peacock: "streaming",
  "Paramount+": "streaming",
  "Amazon Prime Video": "streaming",
  "Prime Video": "streaming",
  "Apple TV+": "streaming",
  "Apple TV": "streaming",
  Netflix: "streaming",
  "MLB.TV": "streaming",
  DAZN: "streaming",
  "F1 TV": "streaming",
  "Hulu": "streaming",
  "fuboTV": "streaming",
};

// Known broadcast networks
const BROADCAST_NETWORKS: Record<string, NetworkType> = {
  ABC: "broadcast",
  CBS: "broadcast",
  FOX: "broadcast",
  NBC: "broadcast",
};

// Known cable networks
const CABLE_NETWORKS: Record<string, NetworkType> = {
  ESPN: "cable",
  ESPN2: "cable",
  ESPNU: "cable",
  FS1: "cable",
  FS2: "cable",
  TNT: "cable",
  TBS: "cable",
  "NFL Network": "cable",
  "MLB Network": "cable",
  "NBA TV": "cable",
  "NHL Network": "cable",
  "SEC Network": "cable",
  "Big Ten Network": "cable",
  "ACC Network": "cable",
  "USA Network": "cable",
  truTV: "cable",
};

function getNetworkType(name: string): NetworkType {
  if (STREAMING_PLATFORMS[name]) return "streaming";
  if (BROADCAST_NETWORKS[name]) return "broadcast";
  if (CABLE_NETWORKS[name]) return "cable";
  // Default unknown networks to cable
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
