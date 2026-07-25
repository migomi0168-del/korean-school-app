import accessoriesData from "@/content/accessories.json";
import type { Accessory } from "@/types";

export const accessories = (accessoriesData as Accessory[]).sort((a, b) => a.requiredLevel - b.requiredLevel);

export function getAccessory(id: string | null | undefined) {
  if (!id) return null;
  return accessories.find((a) => a.id === id) ?? null;
}

export function getUnlockedAccessories(level: number) {
  return accessories.filter((a) => a.requiredLevel <= level);
}

export function getNewlyUnlocked(prevLevel: number, newLevel: number) {
  return accessories.filter((a) => a.requiredLevel > prevLevel && a.requiredLevel <= newLevel);
}
