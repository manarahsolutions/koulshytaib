"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
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
import { IconButton } from "@/components/ui/icon-button";
import { offerTypeLabel } from "@/features/offers/pricing";
import { getOfferProductNames } from "@/features/offers/selectors";
import type { Offer } from "@/features/offers/types";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

export type OfferListProps = {
  offers: Offer[];
  onToggleActive: (offer: Offer) => void;
  onToggleVisible: (offer: Offer) => void;
  onToggleFeatured: (offer: Offer) => void;
  onMove: (offer: Offer, direction: "up" | "down") => void;
  busyId?: string | null;
};

function pricingSummary(offer: Offer): string {
  if (offer.type === "percentage") {
    return `${offer.discountPercent ?? "—"}%`;
  }
  return offer.offerPrice != null ? formatPriceIQD(offer.offerPrice) : "—";
}

export function OfferTable({
  offers,
  onToggleActive,
  onToggleVisible,
  onToggleFeatured,
  onMove,
  busyId,
}: OfferListProps) {
  const router = useRouter();

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[60rem] border-collapse text-sm">
        <caption className="sr-only">قائمة العروض</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
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
            const busy = busyId === offer.id;
            const names = getOfferProductNames(offer);
            return (
              <tr
                key={offer.id}
                className="border-t border-border-soft hover:bg-surface-warm/60"
              >
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/offers/${offer.id}`}
                    className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
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
                    <IconButton
                      aria-label={`رفع ترتيب ${offer.title}`}
                      icon={<ArrowUp />}
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onMove(offer, "up")}
                    />
                    <IconButton
                      aria-label={`تنزيل ترتيب ${offer.title}`}
                      icon={<ArrowDown />}
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => onMove(offer, "down")}
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
    onToggleActive,
    onToggleVisible,
    onToggleFeatured,
    onMove,
    busyId,
  } = props;

  return (
    <ul className="space-y-3 md:hidden">
      {offers.map((offer) => {
        const busy = busyId === offer.id;
        return (
          <li
            key={offer.id}
            className={cn(
              "rounded-lg border border-border bg-surface-elevated p-4",
            )}
          >
            <Link
              href={`/admin/offers/${offer.id}`}
              className="text-base font-semibold text-brand-primary"
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
                  offer.active ? `إيقاف ${offer.title}` : `تفعيل ${offer.title}`
                }
                icon={offer.active ? <PauseCircle /> : <PlayCircle />}
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onToggleActive(offer)}
              />
              <IconButton
                aria-label={
                  offer.visible ? `إخفاء ${offer.title}` : `إظهار ${offer.title}`
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
              <IconButton
                aria-label={`رفع ترتيب ${offer.title}`}
                icon={<ArrowUp />}
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onMove(offer, "up")}
              />
              <IconButton
                aria-label={`تنزيل ترتيب ${offer.title}`}
                icon={<ArrowDown />}
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onMove(offer, "down")}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
