import accessoriesData from "@/content/accessories.json";
import type { Accessory } from "@/types";

export const accessories = (accessoriesData as Accessory[]).sort((a, b) => a.price - b.price);

export function getAccessory(id: string | null | undefined) {
  if (!id) return null;
  return accessories.find((a) => a.id === id) ?? null;
}

export function getOwnedAccessories(ownedIds: string[]) {
  return accessories.filter((a) => ownedIds.includes(a.id));
}
