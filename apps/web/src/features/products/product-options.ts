/**
 * Product option helpers — pricing, validation, cart line identity.
 */

import type {
  Product,
  ProductOption,
  ProductOptionGroup,
} from "@/types/catalog";

export type SelectedOption = {
  optionId: string;
  groupId: string;
  groupName: string;
  optionName: string;
  priceDelta: number;
};

export type OrderOptionSnapshot = {
  groupName: string;
  optionName: string;
  priceDelta: number;
};

export function cartLineKey(
  productId: string,
  selections: readonly SelectedOption[],
): string {
  const ids = selections
    .map((s) => s.optionId)
    .slice()
    .sort();
  return ids.length ? `${productId}::${ids.join(",")}` : productId;
}

export function sumOptionDeltas(
  selections: readonly SelectedOption[],
): number {
  return selections.reduce((sum, s) => sum + Math.trunc(s.priceDelta), 0);
}

export function configuredUnitPrice(
  basePrice: number,
  selections: readonly SelectedOption[],
): number {
  return Math.max(0, Math.trunc(basePrice) + sumOptionDeltas(selections));
}

export function productHasRequiredOptions(product: Product): boolean {
  return (product.optionGroups ?? []).some(
    (g) => g.required && g.options.some((o) => o.available),
  );
}

export function productHasOptions(product: Product): boolean {
  return (product.optionGroups ?? []).some((g) => g.options.length > 0);
}

export function formatSelectionsSummary(
  selections: readonly SelectedOption[] | readonly OrderOptionSnapshot[],
): string {
  if (!selections.length) return "";
  return selections
    .map((s) => {
      const delta =
        "priceDelta" in s && s.priceDelta
          ? s.priceDelta > 0
            ? ` (+${s.priceDelta})`
            : ` (${s.priceDelta})`
          : "";
      return `${s.groupName}: ${s.optionName}${delta}`;
    })
    .join(" · ");
}

export function selectionsToSnapshot(
  selections: readonly SelectedOption[],
): OrderOptionSnapshot[] {
  return selections.map((s) => ({
    groupName: s.groupName,
    optionName: s.optionName,
    priceDelta: s.priceDelta,
  }));
}

export type OptionValidation =
  | { ok: true; selections: SelectedOption[] }
  | { ok: false; message: string };

/**
 * Resolve option ids against catalog groups and validate required/SINGLE/MULTI rules.
 */
export function resolveAndValidateSelections(
  product: Product,
  selectedOptionIds: readonly string[],
): OptionValidation {
  const groups = product.optionGroups ?? [];
  const byId = new Map<string, { group: ProductOptionGroup; option: ProductOption }>();
  for (const group of groups) {
    for (const option of group.options) {
      byId.set(option.id, { group, option });
    }
  }

  const uniqueIds = [...new Set(selectedOptionIds)];
  const selected: SelectedOption[] = [];
  for (const id of uniqueIds) {
    const hit = byId.get(id);
    if (!hit) {
      return { ok: false, message: "أحد الخيارات غير صالح" };
    }
    if (!hit.option.available) {
      return {
        ok: false,
        message: `«${hit.option.name}» غير متوفر حالياً`,
      };
    }
    selected.push({
      optionId: hit.option.id,
      groupId: hit.group.id,
      groupName: hit.group.name,
      optionName: hit.option.name,
      priceDelta: hit.option.priceDelta,
    });
  }

  for (const group of groups) {
    const picked = selected.filter((s) => s.groupId === group.id);
    const availableCount = group.options.filter((o) => o.available).length;
    if (availableCount === 0) continue;

    if (group.selection === "SINGLE" && picked.length > 1) {
      return {
        ok: false,
        message: `اختَر خياراً واحداً من «${group.name}»`,
      };
    }
    if (group.required && picked.length === 0) {
      return {
        ok: false,
        message: `اختَر من «${group.name}»`,
      };
    }
    if (group.selection === "MULTI") {
      const min = group.minSelect ?? (group.required ? 1 : 0);
      const max = group.maxSelect ?? availableCount;
      if (picked.length < min) {
        return {
          ok: false,
          message: `اختَر على الأقل ${min} من «${group.name}»`,
        };
      }
      if (picked.length > max) {
        return {
          ok: false,
          message: `اختَر بحد أقصى ${max} من «${group.name}»`,
        };
      }
    }
  }

  return { ok: true, selections: selected };
}
