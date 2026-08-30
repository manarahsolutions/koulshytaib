import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyOffersToLines,
  sumPricedLines,
} from "@/features/offers/apply-offers";
import { listOffers } from "@/features/offers/offer-repository";
import { getProductById } from "@/features/products/product-repository";
import { isProductAvailable } from "@/features/products/selectors";

export type CartItem = {
  productId: string;
  quantity: number;
  notes?: string;
};

type CartState = {
  items: CartItem[];
  /** Screen-reader announcement after mutations */
  lastAnnouncement: string;
  addItem: (productId: string, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  clearAnnouncement: () => void;
};

function productName(productId: string): string {
  return getProductById(productId)?.name ?? "منتج";
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAnnouncement: "",

      addItem: (productId, quantity = 1, notes) => {
        const product = getProductById(productId);
        if (!product || !isProductAvailable(product)) return;

        const qty = Math.max(1, Math.min(99, quantity));
        const existing = get().items.find((i) => i.productId === productId);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === productId
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
            { productId, quantity: qty, notes: notes?.trim() || undefined },
          ],
          lastAnnouncement: `تمت إضافة ${productName(productId)} إلى السلة`,
        });
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
          lastAnnouncement: `تم حذف ${productName(productId)} من السلة`,
        });
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(99, quantity) }
              : i,
          ),
          lastAnnouncement: `تم تحديث كمية ${productName(productId)}`,
        });
      },

      increment: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) {
          get().addItem(productId, 1);
          return;
        }
        get().setQuantity(productId, item.quantity + 1);
      },

      decrement: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        get().setQuantity(productId, item.quantity - 1);
      },

      updateNotes: (productId, notes) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId
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
      partialize: (state) => ({ items: state.items }),
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
        catalogUnitPrice: product.price,
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
        catalogUnitPrice: product.price,
        quantity: item.quantity,
        name: product.name,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l != null);

  return applyOffersToLines(lines, listOffers());
}

export function selectCartItemQuantity(
  state: CartState,
  productId: string,
): number {
  return state.items.find((i) => i.productId === productId)?.quantity ?? 0;
}
