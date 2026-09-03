"use client";

import {
  Eye,
  EyeOff,
  PackageCheck,
  PackageX,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AvailabilityBadge,
  VisibilityBadge,
} from "@/components/admin/product-status-badges";
import { IconButton } from "@/components/ui/icon-button";
import { getCategoryName } from "@/features/products/selectors";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";

export type ProductListProps = {
  products: Product[];
  onToggleAvailable: (product: Product) => void;
  onToggleVisible: (product: Product) => void;
  busyId?: string | null;
};

export function ProductTable({
  products,
  onToggleAvailable,
  onToggleVisible,
  busyId,
}: ProductListProps) {
  const router = useRouter();

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <caption className="sr-only">قائمة المنتجات</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              المنتج
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              التصنيف
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              السعر
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              التوفر
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الظهور
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              آخر تحديث
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const busy = busyId === product.id;
            return (
              <tr
                key={product.id}
                className="border-t border-border-soft hover:bg-surface-warm/60"
              >
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-text">
                  {getCategoryName(product.categoryId)}
                </td>
                <td className="px-3 py-3 tabular-nums text-text">
                  {formatPriceIQD(product.price)}
                </td>
                <td className="px-3 py-3">
                  <AvailabilityBadge available={product.available} />
                </td>
                <td className="px-3 py-3">
                  <VisibilityBadge visible={product.visible} />
                </td>
                <td className="px-3 py-3 text-text-muted">
                  {formatIraqDateTime(product.updatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <IconButton
                      aria-label={`تعديل ${product.name}`}
                      icon={<Pencil />}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/products/${product.id}`)
                      }
                    />
                    <IconButton
                      aria-label={
                        product.available
                          ? `إيقاف توفر ${product.name}`
                          : `تفعيل توفر ${product.name}`
                      }
                      icon={
                        product.available ? <PackageX /> : <PackageCheck />
                      }
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => onToggleAvailable(product)}
                    />
                    <IconButton
                      aria-label={
                        product.visible
                          ? `إخفاء ${product.name}`
                          : `إظهار ${product.name}`
                      }
                      icon={product.visible ? <EyeOff /> : <Eye />}
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => onToggleVisible(product)}
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

export function ProductCards({
  products,
  onToggleAvailable,
  onToggleVisible,
  busyId,
}: ProductListProps) {
  const router = useRouter();

  return (
    <ul className="space-y-3 md:hidden">
      {products.map((product) => {
        const busy = busyId === product.id;
        return (
          <li
            key={product.id}
            className={cn(
              "rounded-lg border border-border bg-surface-elevated p-4",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-base font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-text-muted">
                  {getCategoryName(product.categoryId)}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-text">
                  {formatPriceIQD(product.price)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <AvailabilityBadge available={product.available} />
                <VisibilityBadge visible={product.visible} />
              </div>
            </div>

            <p className="typo-caption mt-3 text-text-muted">
              آخر تحديث: {formatIraqDateTime(product.updatedAt)}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              <IconButton
                aria-label={`تعديل ${product.name}`}
                icon={<Pencil />}
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/products/${product.id}`)}
              />
              <IconButton
                aria-label={
                  product.available
                    ? `إيقاف توفر ${product.name}`
                    : `تفعيل توفر ${product.name}`
                }
                icon={product.available ? <PackageX /> : <PackageCheck />}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onToggleAvailable(product)}
              />
              <IconButton
                aria-label={
                  product.visible
                    ? `إخفاء ${product.name}`
                    : `إظهار ${product.name}`
                }
                icon={product.visible ? <EyeOff /> : <Eye />}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onToggleVisible(product)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
