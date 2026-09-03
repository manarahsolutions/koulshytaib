"use client";

import {
  Eye,
  EyeOff,
  GripVertical,
  PackageCheck,
  PackageX,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
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
  /** Full catalog — used to reorder within a category on drop */
  allProducts: Product[];
  onToggleAvailable: (product: Product) => void;
  onToggleVisible: (product: Product) => void;
  onReorder: (categoryId: string, orderedIds: string[]) => void;
  busyId?: string | null;
  reorderBusy?: boolean;
};

function siblingsInCategory(
  allProducts: Product[],
  categoryId: string,
): Product[] {
  return allProducts
    .filter((p) => p.categoryId === categoryId)
    .slice()
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
    );
}

function orderedIdsAfterMove(
  allProducts: Product[],
  sourceId: string,
  targetId: string,
): { categoryId: string; orderedIds: string[] } | null {
  const source = allProducts.find((p) => p.id === sourceId);
  const target = allProducts.find((p) => p.id === targetId);
  if (!source || !target || source.categoryId !== target.categoryId) {
    return null;
  }
  const siblings = siblingsInCategory(allProducts, source.categoryId);
  const from = siblings.findIndex((p) => p.id === sourceId);
  const to = siblings.findIndex((p) => p.id === targetId);
  if (from < 0 || to < 0 || from === to) return null;
  const next = siblings.slice();
  const [item] = next.splice(from, 1);
  if (!item) return null;
  next.splice(to, 0, item);
  return {
    categoryId: source.categoryId,
    orderedIds: next.map((p) => p.id),
  };
}

export function ProductTable({
  products,
  allProducts,
  onToggleAvailable,
  onToggleVisible,
  onReorder,
  busyId,
  reorderBusy,
}: ProductListProps) {
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const finishDrop = (sourceId: string, targetId: string) => {
    const result = orderedIdsAfterMove(allProducts, sourceId, targetId);
    setDragId(null);
    setOverId(null);
    if (!result) return;
    onReorder(result.categoryId, result.orderedIds);
  };

  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[54rem] border-collapse text-sm">
        <caption className="sr-only">قائمة المنتجات — اسحب الصف لترتيب التصنيف</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="w-10 px-2 py-3">
              <span className="sr-only">ترتيب</span>
            </th>
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
            const busy = busyId === product.id || reorderBusy;
            return (
              <tr
                key={product.id}
                draggable={!reorderBusy}
                onDragStart={(e: DragEvent<HTMLTableRowElement>) => {
                  setDragId(product.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", product.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (overId !== product.id) setOverId(product.id);
                }}
                onDragLeave={() => {
                  if (overId === product.id) setOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId =
                    dragId ?? e.dataTransfer.getData("text/plain");
                  if (sourceId) finishDrop(sourceId, product.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={cn(
                  "border-t border-border-soft hover:bg-surface-warm/60",
                  dragId === product.id && "opacity-50",
                  overId === product.id &&
                    dragId &&
                    dragId !== product.id &&
                    "bg-brand-primary/8",
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
                    href={`/admin/products/${product.id}`}
                    className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    onClick={(e) => {
                      if (dragId) e.preventDefault();
                    }}
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
  allProducts,
  onToggleAvailable,
  onToggleVisible,
  onReorder,
  busyId,
  reorderBusy,
}: ProductListProps) {
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const finishDrop = (sourceId: string, targetId: string) => {
    const result = orderedIdsAfterMove(allProducts, sourceId, targetId);
    setDragId(null);
    setOverId(null);
    if (!result) return;
    onReorder(result.categoryId, result.orderedIds);
  };

  return (
    <ul className="space-y-3 md:hidden">
      {products.map((product) => {
        const busy = busyId === product.id || reorderBusy;
        return (
          <li
            key={product.id}
            draggable={!reorderBusy}
            onDragStart={(e: DragEvent<HTMLLIElement>) => {
              setDragId(product.id);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", product.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (overId !== product.id) setOverId(product.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
              if (sourceId) finishDrop(sourceId, product.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            className={cn(
              "rounded-lg border border-border bg-surface-elevated p-4",
              dragId === product.id && "opacity-50",
              overId === product.id &&
                dragId &&
                dragId !== product.id &&
                "border-brand-primary",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span
                  className="mt-1 inline-flex cursor-grab text-text-muted active:cursor-grabbing"
                  aria-hidden
                >
                  <GripVertical className="size-4" />
                </span>
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
