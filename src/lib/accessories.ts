import accessoriesData from "@/content/accessories.json";
import type { Accessory } from "@/types";

export const accessories = (accessoriesData as Accessory[]).sort((a, b) => a.price - b.price);

// "avatar" items render on the character (single equip slot); "badge" items
// (medals/gems) render in the room's display case and can be equipped many
// at once, so shop/closet UI needs to treat the two groups differently.
export const avatarAccessories = accessories.filter((a) => a.category === "avatar");
export const badgeAccessories = accessories.filter((a) => a.category === "badge");

export function getAccessory(id: string | null | undefined) {
  if (!id) return null;
  return accessories.find((a) => a.id === id) ?? null;
}

export function getOwnedAccessories(ownedIds: string[]) {
  return accessories.filter((a) => ownedIds.includes(a.id));
}

// Preserves the student's equip order (most-recently-equipped last) rather
// than the shop's price-sorted order, so the display case doesn't reshuffle
// every time a new badge is bought.
export function getEquippedBadges(equippedIds: string[]) {
  return equippedIds.map((id) => getAccessory(id)).filter((a): a is Accessory => a !== null);
}
