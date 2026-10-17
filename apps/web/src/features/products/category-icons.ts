/**
 * Shared Lucide icon map for menu categories (no emoji).
 */

import {
  CakeSlice,
  CookingPot,
  Croissant,
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

/** Dashboard categories have opaque ids, so match on the Arabic name. */
const NAME_ICONS: [RegExp, LucideIcon][] = [
  [/محاشي|محشي|دولم/, CookingPot],
  [/مقبلات|كبة|سمبوس/, Salad],
  [/معجنات|مخبوزات|فطائر/, Croissant],
  [/حلويات|كليچة|كليجة/, CakeSlice],
  [/مرق|شوربة/, Soup],
  [/مشروب|عصير/, CupSoda],
];

export function getCategoryIcon(
  categoryId: string,
  categoryName?: string,
): LucideIcon {
  const byId = CATEGORY_ICONS[categoryId];
  if (byId) return byId;
  if (categoryName) {
    for (const [pattern, icon] of NAME_ICONS) {
      if (pattern.test(categoryName)) return icon;
    }
  }
  return HandPlatter;
}
