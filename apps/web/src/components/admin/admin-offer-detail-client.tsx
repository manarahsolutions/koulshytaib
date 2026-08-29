"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  fetchOffersAction,
  updateOfferAction,
} from "@/app/actions/backend";
import { OfferForm } from "@/components/admin/offer-form";
import {
  OfferActiveBadge,
  OfferFeaturedBadge,
  OfferVisibilityBadge,
} from "@/components/admin/offer-status-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getOfferById,
  replaceOffersFromServer,
  upsertOfferInCache,
} from "@/features/offers/offer-repository";
import { updateOffer } from "@/features/offers/offer-service";
import { offerTypeLabel, resolveOfferPricing } from "@/features/offers/pricing";
import {
  getOfferProductNames,
  getOfferProductWarnings,
} from "@/features/offers/selectors";
import { useOffersRevision } from "@/features/offers/use-offers";
import { getProductById } from "@/features/products/product-repository";
import { useProducts } from "@/features/products/use-catalog";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";
import { formatPriceIQD } from "@/lib/format/price";

export function AdminOfferDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  useOffersRevision();
  const products = useProducts();
  const offer = getOfferById(params.id);
  const [toast, setToast] = useState<string | null>(null);

  if (!offer) {
    return (
      <EmptyState
        title="ما لكينا هذا العرض"
        description="قد يكون المعرّف غير صحيح أو البيانات أُعيد ضبطها بعد تحديث الصفحة."
        action={
          <Button onClick={() => router.push("/admin/offers")}>
            رجوع للعروض
          </Button>
        }
      />
    );
  }

  const primary = getProductById(offer.productIds[0] ?? "");
  const pricing = primary
    ? resolveOfferPricing(offer, primary.price)
    : null;
  const warnings = getOfferProductWarnings(offer);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/offers"
          className="inline-flex h-11 items-center gap-2 text-sm font-medium text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <ArrowRight className="size-4" aria-hidden />
          رجوع للعروض
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">تعديل عرض</h1>
        <p className="mt-1 text-sm text-text-muted">{offer.title}</p>
      </div>

      {toast ? (
        <p
          className="rounded-md border border-success/25 bg-success-subtle px-3 py-2 text-sm text-success"
          role="status"
          aria-live="polite"
        >
          {toast}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-warning/40 bg-warning-subtle px-3 py-2 text-sm text-warning-text">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      <section
        aria-label="ملخص العرض"
        className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <p className="typo-caption text-text-muted">النوع</p>
          <p className="mt-1 text-sm font-medium">{offerTypeLabel(offer.type)}</p>
        </div>
        <div>
          <p className="typo-caption text-text-muted">التسعير</p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {pricing
              ? `${formatPriceIQD(pricing.offerPrice)} ← ${formatPriceIQD(pricing.originalPrice)}`
              : "—"}
          </p>
          {pricing && pricing.saving > 0 ? (
            <p className="text-xs text-text-muted">
              وفّر {formatPriceIQD(pricing.saving)}
            </p>
          ) : null}
        </div>
        <div>
          <p className="typo-caption text-text-muted">المنتجات</p>
          <p className="mt-1 text-sm font-medium">
            {getOfferProductNames(offer).join("، ")}
          </p>
          {primary ? (
            <p className="text-xs text-text-muted">
              سعر الكتالوج الحالي: {formatPriceIQD(primary.price)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <OfferActiveBadge active={offer.active} />
          <OfferVisibilityBadge visible={offer.visible} />
          <OfferFeaturedBadge featured={offer.featured} />
        </div>
        <div>
          <p className="typo-caption text-text-muted">الترتيب</p>
          <p className="mt-1 text-sm tabular-nums">{offer.sortOrder}</p>
        </div>
        <div>
          <p className="typo-caption text-text-muted">التواريخ</p>
          <p className="mt-1 text-xs text-text-muted">
            أُنشئ {formatIraqDateTime(offer.createdAt)}
          </p>
          <p className="text-xs text-text-muted">
            حُدّث {formatIraqDateTime(offer.updatedAt)}
          </p>
        </div>
      </section>

      <OfferForm
        key={offer.updatedAt}
        products={products}
        initial={offer}
        submitLabel="حفظ التعديلات"
        onSubmit={async (values) => {
          const result = await runAdminMutation({
            db: () => updateOfferAction(offer.id, values),
            memory: () => updateOffer(offer.id, values),
            onDbSuccess: async (next) => {
              if (next.featured) {
                const all = await fetchOffersAction();
                if (all.ok) replaceOffersFromServer(all.data);
                else upsertOfferInCache(next);
              } else {
                upsertOfferInCache(next);
              }
            },
          });
          if (!result.ok) return result.message;
          setToast("تم تحديث العرض");
          window.setTimeout(() => setToast(null), 2200);
          return null;
        }}
      />
    </div>
  );
}
