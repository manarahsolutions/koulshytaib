/**
 * Shared Lucide icon map for menu categories (no emoji).
 */

import {
  CakeSlice,
  CookingPot,
  CupSoda,
  HandPlatter,
  Salad,
  Soup,
  type LucideIcon,
} from "lucide-react";

/** Home-kitchen metaphors — Lucide only, shared stroke via ICON_STROKE. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  mains: HandPlatter,
  stews: Soup,
  mahshi: CookingPot,
  starters: Salad,
  desserts: CakeSlice,
  drinks: CupSoda,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? HandPlatter;
}
