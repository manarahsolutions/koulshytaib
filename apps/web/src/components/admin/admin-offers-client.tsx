"use client";

import { Plus, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  fetchOffersAction,
  reorderOffersAction,
  setOfferActiveAction,
  setOfferFeaturedAction,
  setOfferVisibilityAction,
} from "@/app/actions/backend";
import { OfferFilters } from "@/components/admin/offer-filters";
import { OfferCards, OfferTable } from "@/components/admin/offer-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  replaceOffersFromServer,
  upsertOfferInCache,
} from "@/features/offers/offer-repository";
import {
  reorderOffers,
  setOfferActive,
  setOfferFeatured,
  setOfferVisibility,
} from "@/features/offers/offer-service";
import type { OfferListFilter } from "@/features/offers/selectors";
import {
  useAdminOfferList,
  useOffers,
} from "@/features/offers/use-offers";
import type { Offer } from "@/features/offers/types";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";

async function refreshOffersCache() {
  const offers = await fetchOffersAction();
  if (offers.ok) replaceOffersFromServer(offers.data);
}

export function AdminOffersClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OfferListFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const allOffers = useOffers();
  const offers = useAdminOfferList({ query, status });

  const hasFilters = query.trim().length > 0 || status !== "all";
  const clear = () => {
    setQuery("");
    setStatus("all");
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const withBusy = async (offer: Offer, fn: () => Promise<void>) => {
    setBusyId(offer.id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  const onReorder = (orderedIds: string[]) => {
    void (async () => {
      setReorderBusy(true);
      try {
        const result = await runAdminMutation({
          db: () => reorderOffersAction(orderedIds),
          memory: () => reorderOffers(orderedIds),
          onDbSuccess: async () => {
            await refreshOffersCache();
          },
        });
        flash(result.ok ? "تم تحديث ترتيب العروض" : result.message);
      } finally {
        setReorderBusy(false);
      }
    })();
  };

  const listProps = {
    offers,
    allOffers,
    busyId,
    reorderBusy,
    onReorder,
    onToggleActive: (offer: Offer) =>
      void withBusy(offer, async () => {
        const result = await runAdminMutation({
          db: () => setOfferActiveAction(offer.id, !offer.active),
          memory: () => setOfferActive(offer.id, !offer.active),
          onDbSuccess: (next) => upsertOfferInCache(next),
        });
        flash(result.ok ? "تم تحديث العرض" : result.message);
      }),
    onToggleVisible: (offer: Offer) =>
      void withBusy(offer, async () => {
        const result = await runAdminMutation({
          db: () => setOfferVisibilityAction(offer.id, !offer.visible),
          memory: () => setOfferVisibility(offer.id, !offer.visible),
          onDbSuccess: (next) => upsertOfferInCache(next),
        });
        flash(result.ok ? "تم تحديث العرض" : result.message);
      }),
    onToggleFeatured: (offer: Offer) =>
      void withBusy(offer, async () => {
        const result = await runAdminMutation({
          db: () => setOfferFeaturedAction(offer.id, !offer.featured),
          memory: () => setOfferFeatured(offer.id, !offer.featured),
          onDbSuccess: async () => {
            await refreshOffersCache();
          },
        });
        flash(result.ok ? "تم تحديث العرض" : result.message);
      }),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">العروض</h1>
          <p className="mt-1 text-sm text-text-muted">
            إدارة العروض الظاهرة لزبائن كلشي طيب — اسحب الصفوف لإعادة الترتيب
          </p>
        </div>
        <Button
          startIcon={<Plus />}
          onClick={() => router.push("/admin/offers/new")}
        >
          إضافة عرض
        </Button>
      </header>

      {toast ? (
        <p
          className="rounded-md border border-success/25 bg-success-subtle px-3 py-2 text-sm text-success"
          role="status"
          aria-live="polite"
        >
          {toast}
        </p>
      ) : null}

      <OfferFilters
        query={query}
        status={status}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onClear={clear}
        showClear={hasFilters}
      />

      {allOffers.length === 0 ? (
        <EmptyState
          icon={<Tag />}
          title="ماكو عروض حالياً"
          description="أضف أول عرض من زر إضافة عرض."
          action={
            <Link
              href="/admin/offers/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              إضافة عرض
            </Link>
          }
        />
      ) : offers.length === 0 ? (
        <EmptyState
          icon={<Tag />}
          title="ماكو عروض مطابقة"
          description="جرّب مسح البحث أو تغيير الفلتر."
          action={
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              مسح الفلاتر
            </button>
          }
        />
      ) : (
        <>
          <OfferTable {...listProps} />
          <OfferCards {...listProps} />
        </>
      )}
    </div>
  );
}
