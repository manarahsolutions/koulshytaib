"use client";

import { GripVertical } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";
import type { Category, Product } from "@/types/catalog";

export type AdminProductReorderProps = {
  categories: Category[];
  products: Product[];
  onSave: (categoryId: string, orderedIds: string[]) => Promise<boolean>;
  onClose: () => void;
};

function sortedIdsForCategory(
  products: Product[],
  categoryId: string,
): string[] {
  return products
    .filter((p) => p.categoryId === categoryId)
    .slice()
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"),
    )
    .map((p) => p.id);
}

export function AdminProductReorder({
  categories,
  products,
  onSave,
  onClose,
}: AdminProductReorderProps) {
  const visibleCategories = categories.filter((c) =>
    products.some((p) => p.categoryId === c.id),
  );
  const defaultCategoryId =
    visibleCategories[0]?.id ?? categories[0]?.id ?? "";

  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [localOrder, setLocalOrder] = useState<{
    categoryId: string;
    ids: string[];
  } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const serverIds = useMemo(
    () => sortedIdsForCategory(products, categoryId),
    [products, categoryId],
  );

  const orderedIds =
    localOrder?.categoryId === categoryId ? localOrder.ids : serverIds;

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p] as const)),
    [products],
  );
  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  const dirty =
    localOrder?.categoryId === categoryId &&
    localOrder.ids.join(",") !== serverIds.join(",");

  const moveIndex = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= orderedIds.length) return;
    const next = orderedIds.slice();
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setLocalOrder({ categoryId, ids: next });
  };

  const onDragStart = (id: string) => (e: DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (targetId: string) => (e: DragEvent) => {
    e.preventDefault();
    const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
    setDragId(null);
    if (!sourceId || sourceId === targetId) return;
    moveIndex(orderedIds.indexOf(sourceId), orderedIds.indexOf(targetId));
  };

  const save = async () => {
    if (!categoryId || !dirty) return;
    setBusy(true);
    try {
      const ok = await onSave(categoryId, orderedIds);
      if (ok) setLocalOrder(null);
    } finally {
      setBusy(false);
    }
  };

  if (!categories.length) {
    return (
      <p className="text-sm text-text-muted">أضف تصنيفاً أولاً قبل الترتيب.</p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base font-semibold text-brand-navy">
            ترتيب منتجات التصنيف
          </h2>
          <p className="text-sm text-text-muted">
            اسحب الصف لترتيب الظهور في المنيو، ثم احفظ. الترتيب داخل كل تصنيف
            لوحده.
          </p>
          <label
            className="block text-sm font-medium text-text"
            htmlFor="reorder-cat"
          >
            التصنيف
          </label>
          <Select
            id="reorder-cat"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setLocalOrder(null);
            }}
          >
            {(visibleCategories.length ? visibleCategories : categories).map(
              (c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ),
            )}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button
            type="button"
            loading={busy}
            disabled={!dirty || ordered.length < 2}
            onClick={() => void save()}
          >
            حفظ الترتيب
          </Button>
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-text-muted">ماكو منتجات بهذا التصنيف.</p>
      ) : (
        <ol className="space-y-2" aria-label="قائمة ترتيب المنتجات">
          {ordered.map((product, index) => (
            <li
              key={product.id}
              draggable
              onDragStart={onDragStart(product.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop(product.id)}
              onDragEnd={() => setDragId(null)}
              className={cn(
                "flex cursor-grab items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 active:cursor-grabbing",
                dragId === product.id &&
                  "opacity-60 ring-2 ring-brand-primary/40",
              )}
            >
              <GripVertical
                className="size-5 shrink-0 text-text-muted"
                aria-hidden
              />
              <span className="w-7 shrink-0 text-sm font-semibold tabular-nums text-text-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-brand-navy">
                  {product.name}
                </p>
                <p className="text-xs tabular-nums text-text-muted">
                  {formatPriceIQD(product.price)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === 0 || busy}
                  aria-label={`نقل ${product.name} للأعلى`}
                  onClick={() => moveIndex(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index >= ordered.length - 1 || busy}
                  aria-label={`نقل ${product.name} للأسفل`}
                  onClick={() => moveIndex(index, index + 1)}
                >
                  ↓
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
