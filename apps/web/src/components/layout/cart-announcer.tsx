"use client";

import { useEffect } from "react";
import { useCartStore } from "@/features/cart/cart-store";

/** Polite live region for cart mutations (add / update / remove). */
export function CartAnnouncer() {
  const announcement = useCartStore((s) => s.lastAnnouncement);
  const clearAnnouncement = useCartStore((s) => s.clearAnnouncement);

  useEffect(() => {
    if (!announcement) return;
    const t = window.setTimeout(() => clearAnnouncement(), 2500);
    return () => window.clearTimeout(t);
  }, [announcement, clearAnnouncement]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
