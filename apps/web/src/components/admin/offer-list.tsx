"use client";

import {
  Eye,
  EyeOff,
  GripVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  OfferActiveBadge,
  OfferFeaturedBadge,
  OfferVisibilityBadge,
} from "@/components/admin/offer-status-badges";
import { useSortableDrag } from "@/components/admin/use-sortable-drag";
import { IconButton } from "@/components/ui/icon-button";
import { offerTypeLabel } from "@/features/offers/pricing";
import { getOfferProductNames } from "@/features/offers/selectors";
import type { Offer } from "@/features/offers/types";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { orderedIdsAfterDrop } from "@/lib/reorder/ordered-ids-after-drop";
import { cn } from "@/lib/utils/cn";

export type OfferListProps = {
  offers: Offer[];
  /** Full catalog order — used so filtered views still persist a complete reorder. */
  allOffers: Offer[];
  onToggleActive: (offer: Offer) => void;
  onToggleVisible: (offer: Offer) => void;
  onToggleFeatured: (offer: Offer) => void;
  onReorder: (orderedIds: string[]) => void;
  busyId?: string | null;
  reorderBusy?: boolean;
};

function pricingSummary(offer: Offer): string {
  if (offer.type === "percentage") {
    return `${offer.discountPercent ?? "—"}%`;
  }
  return offer.offerPrice != null ? formatPriceIQD(offer.offerPrice) : "—";
}

function finishOfferReorder(
  allOffers: Offer[],
  sourceId: string,
  targetId: string,
  onReorder: (orderedIds: string[]) => void,
) {
  const ids = allOffers.map((o) => o.id);
  const next = orderedIdsAfterDrop(ids, sourceId, targetId);
  if (next) onReorder(next);
}

export function OfferTable({
  offers,
  allOffers,
  onToggleActive,
  onToggleVisible,
  onToggleFeatured,
  onReorder,
  busyId,
  reorderBusy,
}: OfferListProps) {
  const router = useRouter();
  const sortable = useSortableDrag({
    disabled: Boolean(reorderBusy),
    onDropReorder: (sourceId, targetId) =>
      finishOfferReorder(allOffers, sourceId, targetId, onReorder),
  });

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[60rem] border-collapse text-sm">
        <caption className="sr-only">
          قائمة العروض — اسحب الصف لإعادة الترتيب
        </caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="w-10 px-2 py-3">
              <span className="sr-only">ترتيب</span>
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              العرض
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              النوع
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              التسعير
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              المنتجات
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              الحالة
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              آخر تحديث
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const busy = busyId === offer.id || reorderBusy;
            const names = getOfferProductNames(offer);
            const drag = sortable.itemProps(offer.id);
            return (
              <tr
                key={offer.id}
                {...drag}
                className={cn(
                  "border-t border-border-soft hover:bg-surface-warm/60",
                  drag.className,
                )}
              >
                <td className="px-2 py-3">
                  <span
                    className="inline-flex cursor-grab text-text-muted active:cursor-grabbing"
                    aria-hidden
                    title="اسحب لإعادة الترتيب"
                  >
                    <GripVertical className="size-4" />
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/offers/${offer.id}`}
                    className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    onClick={(e) => {
                      if (sortable.dragId) e.preventDefault();
                    }}
                  >
                    {offer.title}
                  </Link>
                  <div className="mt-1">
                    <OfferFeaturedBadge featured={offer.featured} />
                  </div>
                </td>
                <td className="px-3 py-3">{offerTypeLabel(offer.type)}</td>
                <td className="px-3 py-3 tabular-nums">{pricingSummary(offer)}</td>
                <td className="px-3 py-3 text-text-muted">
                  {names.join("، ")}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <OfferActiveBadge active={offer.active} />
                    <OfferVisibilityBadge visible={offer.visible} />
                  </div>
                </td>
                <td className="px-3 py-3 text-text-muted">
                  {formatIraqDateTime(offer.updatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <IconButton
                      aria-label={`تعديل ${offer.title}`}
                      icon={<Pencil />}
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/admin/offers/${offer.id}`)}
                    />
                    <IconButton
                      aria-label={
                        offer.active
                          ? `إيقاف ${offer.title}`
                          : `تفعيل ${offer.title}`
                      }
                      icon={offer.active ? <PauseCircle /> : <PlayCircle />}
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onToggleActive(offer)}
                    />
                    <IconButton
                      aria-label={
                        offer.visible
                          ? `إخفاء ${offer.title}`
                          : `إظهار ${offer.title}`
                      }
                      icon={offer.visible ? <EyeOff /> : <Eye />}
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onToggleVisible(offer)}
                    />
                    <IconButton
                      aria-label={
                        offer.featured
                          ? `إلغاء تمييز ${offer.title}`
                          : `تمييز ${offer.title}`
                      }
                      icon={<Star />}
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onToggleFeatured(offer)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function OfferCards(props: OfferListProps) {
  const router = useRouter();
  const {
    offers,
    allOffers,
    onToggleActive,
    onToggleVisible,
    onToggleFeatured,
    onReorder,
    busyId,
    reorderBusy,
  } = props;

  const sortable = useSortableDrag({
    disabled: Boolean(reorderBusy),
    onDropReorder: (sourceId, targetId) =>
      finishOfferReorder(allOffers, sourceId, targetId, onReorder),
  });

  return (
    <ul className="space-y-3 md:hidden">
      {offers.map((offer) => {
        const busy = busyId === offer.id || reorderBusy;
        const drag = sortable.itemProps(offer.id);
        return (
          <li
            key={offer.id}
            {...drag}
            className={sortable.cardClassName(
              offer.id,
              "rounded-lg border border-border bg-surface-elevated p-4",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 inline-flex cursor-grab text-text-muted active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/offers/${offer.id}`}
                  className="text-base font-semibold text-brand-primary"
                  onClick={(e) => {
                    if (sortable.dragId) e.preventDefault();
                  }}
                >
                  {offer.title}
                </Link>
                <p className="mt-1 text-sm text-text-muted">
                  {offerTypeLabel(offer.type)} · {pricingSummary(offer)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {getOfferProductNames(offer).join("، ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <OfferActiveBadge active={offer.active} />
                  <OfferVisibilityBadge visible={offer.visible} />
                  <OfferFeaturedBadge featured={offer.featured} />
                </div>
                <p className="typo-caption mt-2 text-text-muted">
                  {formatIraqDateTime(offer.updatedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <IconButton
                    aria-label={`تعديل ${offer.title}`}
                    icon={<Pencil />}
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/offers/${offer.id}`)}
                  />
                  <IconButton
                    aria-label={
                      offer.active
                        ? `إيقاف ${offer.title}`
                        : `تفعيل ${offer.title}`
                    }
                    icon={offer.active ? <PauseCircle /> : <PlayCircle />}
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onToggleActive(offer)}
                  />
                  <IconButton
                    aria-label={
                      offer.visible
                        ? `إخفاء ${offer.title}`
                        : `إظهار ${offer.title}`
                    }
                    icon={offer.visible ? <EyeOff /> : <Eye />}
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onToggleVisible(offer)}
                  />
                  <IconButton
                    aria-label={`تمييز ${offer.title}`}
                    icon={<Star />}
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onToggleFeatured(offer)}
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
