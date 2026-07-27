import roomColorsData from "@/content/roomColors.json";
import type { CSSProperties } from "react";
import type { RoomColor } from "@/types";

export const roomColors = roomColorsData as RoomColor[];

export function getRoomColor(id: string | null | undefined) {
  if (!id) return roomColors[0];
  return roomColors.find((c) => c.id === id) ?? roomColors[0];
}

// Rendered via inline style (not Tailwind utility classes) since the
// gradient/pattern colors are data-driven values, not fixed class names.
export function getRoomBackgroundStyle(color: RoomColor): CSSProperties {
  const [c1, c2] = color.colors;
  if (color.pattern === "stripes") {
    return { backgroundImage: `repeating-linear-gradient(135deg, ${c1}, ${c1} 16px, ${c2} 16px, ${c2} 32px)` };
  }
  if (color.pattern === "dots") {
    return {
      backgroundColor: c1,
      backgroundImage: `radial-gradient(${c2} 22%, transparent 23%)`,
      backgroundSize: "20px 20px",
    };
  }
  return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
}
