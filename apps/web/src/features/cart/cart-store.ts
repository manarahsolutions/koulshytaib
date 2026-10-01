import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyOffersToLines,
  sumPricedLines,
} from "@/features/offers/apply-offers";
import { listOffers } from "@/features/offers/offer-repository";
import {
  cartLineKey,
  configuredUnitPrice,
  type SelectedOption,
} from "@/features/products/product-options";
import { getProductById } from "@/features/products/product-repository";
import { isProductAvailable } from "@/features/products/selectors";

export type CartItem = {
  /** productId + sorted option ids */
  lineKey: string;
  productId: string;
  quantity: number;
  notes?: string;
  selections: SelectedOption[];
};

type CartState = {
  items: CartItem[];
  /** Screen-reader announcement after mutations */
  lastAnnouncement: string;
  addItem: (
    productId: string,
    quantity?: number,
    notes?: string,
    selections?: SelectedOption[],
  ) => void;
  removeItem: (lineKey: string) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  increment: (lineKey: string) => void;
  decrement: (lineKey: string) => void;
  updateNotes: (lineKey: string, notes: string) => void;
  clearCart: () => void;
  clearAnnouncement: () => void;
};

function productName(productId: string): string {
  return getProductById(productId)?.name ?? "منتج";
}

function normalizeSelections(
  selections: SelectedOption[] | undefined,
): SelectedOption[] {
  return selections?.length ? selections : [];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAnnouncement: "",

      addItem: (productId, quantity = 1, notes, selections) => {
        const product = getProductById(productId);
        if (!product || !isProductAvailable(product)) return;

        const qty = Math.max(1, Math.min(99, quantity));
        const nextSelections = normalizeSelections(selections);
        const key = cartLineKey(productId, nextSelections);
        const existing = get().items.find((i) => i.lineKey === key);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.lineKey === key
                ? {
                    ...i,
                    quantity: Math.min(99, i.quantity + qty),
                    notes: notes ?? i.notes,
                  }
                : i,
            ),
            lastAnnouncement: `تم تحديث كمية ${productName(productId)} في السلة`,
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              lineKey: key,
              productId,
              quantity: qty,
              notes: notes?.trim() || undefined,
              selections: nextSelections,
            },
          ],
          lastAnnouncement: `تمت إضافة ${productName(productId)} إلى السلة`,
        });
      },

      removeItem: (lineKey) => {
        const item = get().items.find((i) => i.lineKey === lineKey);
        set({
          items: get().items.filter((i) => i.lineKey !== lineKey),
          lastAnnouncement: `تم حذف ${productName(item?.productId ?? "")} من السلة`,
        });
      },

      setQuantity: (lineKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineKey);
          return;
        }
        const item = get().items.find((i) => i.lineKey === lineKey);
        set({
          items: get().items.map((i) =>
            i.lineKey === lineKey
              ? { ...i, quantity: Math.min(99, quantity) }
              : i,
          ),
          lastAnnouncement: `تم تحديث كمية ${productName(item?.productId ?? "")}`,
        });
      },

      increment: (lineKey) => {
        const item = get().items.find((i) => i.lineKey === lineKey);
        if (!item) return;
        get().setQuantity(lineKey, item.quantity + 1);
      },

      decrement: (lineKey) => {
        const item = get().items.find((i) => i.lineKey === lineKey);
        if (!item) return;
        get().setQuantity(lineKey, item.quantity - 1);
      },

      updateNotes: (lineKey, notes) => {
        set({
          items: get().items.map((i) =>
            i.lineKey === lineKey
              ? { ...i, notes: notes.trim() || undefined }
              : i,
          ),
        });
      },

      clearCart: () =>
        set({
          items: [],
          lastAnnouncement: "تم تفريغ السلة",
        }),

      clearAnnouncement: () => set({ lastAnnouncement: "" }),
    }),
    {
      name: "koulshy-taib-cart",
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted) => {
        const state = persisted as { items?: Array<Partial<CartItem> & { productId: string }> };
        const items = (state.items ?? []).map((item) => {
          const selections = item.selections ?? [];
          return {
            lineKey:
              item.lineKey ?? cartLineKey(item.productId, selections),
            productId: item.productId,
            quantity: item.quantity ?? 1,
            notes: item.notes,
            selections,
          } satisfies CartItem;
        });
        return { items } as CartState;
      },
    },
  ),
);

/** Distinct line items in the cart (badge uses this). */
export function selectCartLineCount(state: CartState): number {
  return state.items.length;
}

/** Sum of all unit quantities. */
export function selectCartUnitCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function selectCartSubtotal(state: CartState): number {
  const lines = state.items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        catalogUnitPrice: configuredUnitPrice(
          product.price,
          item.selections ?? [],
        ),
        quantity: item.quantity,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l != null);

  return sumPricedLines(applyOffersToLines(lines, listOffers()));
}

/** Per-line pricing including best active offer (for UI). */
export function selectCartPricedLines(state: CartState) {
  const lines = state.items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        catalogUnitPrice: configuredUnitPrice(
          product.price,
          item.selections ?? [],
        ),
        quantity: item.quantity,
        name: product.name,
        lineKey: item.lineKey,
        selections: item.selections ?? [],
        notes: item.notes,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l != null);

  return applyOffersToLines(lines, listOffers()).map((priced, index) => ({
    ...priced,
    lineKey: lines[index]!.lineKey,
    selections: lines[index]!.selections,
    notes: lines[index]!.notes,
  }));
}

export function selectCartItemQuantity(
  state: CartState,
  productId: string,
): number {
  return state.items
    .filter((i) => i.productId === productId)
    .reduce((sum, i) => sum + i.quantity, 0);
}

export function selectCartLineQuantity(
  state: CartState,
  lineKey: string,
): number {
  return state.items.find((i) => i.lineKey === lineKey)?.quantity ?? 0;
}
