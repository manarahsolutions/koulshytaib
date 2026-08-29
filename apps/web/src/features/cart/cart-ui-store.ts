"use client";

import { create } from "zustand";

type CartUiState = {
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  toggleSheet: () => void;
};

/** Ephemeral UI — not persisted. Opens cart sheet from header / bottom nav. */
export const useCartUiStore = create<CartUiState>((set) => ({
  sheetOpen: false,
  openSheet: () => set({ sheetOpen: true }),
  closeSheet: () => set({ sheetOpen: false }),
  toggleSheet: () => set((s) => ({ sheetOpen: !s.sheetOpen })),
}));
