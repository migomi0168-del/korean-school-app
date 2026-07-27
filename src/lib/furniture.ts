import furnitureData from "@/content/furniture.json";
import type { Furniture } from "@/types";

export const furniture = furnitureData as Furniture[];

export function getFurniture(id: string | null | undefined) {
  if (!id) return null;
  return furniture.find((f) => f.id === id) ?? null;
}

export function getOwnedFurniture(ownedIds: string[]) {
  return furniture.filter((f) => ownedIds.includes(f.id));
}
