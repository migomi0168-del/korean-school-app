import roomColorsData from "@/content/roomColors.json";
import type { RoomColor } from "@/types";

export const roomColors = roomColorsData as RoomColor[];

export function getRoomColor(id: string | null | undefined) {
  if (!id) return roomColors[0];
  return roomColors.find((c) => c.id === id) ?? roomColors[0];
}
