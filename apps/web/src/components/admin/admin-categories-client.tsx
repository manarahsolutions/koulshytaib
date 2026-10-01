"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import {
  createCategoryAction,
  fetchCatalogAction,
  reorderCategoriesAction,
  setCategoryVisibilityAction,
  updateCategoryAction,
} from "@/app/actions/backend";
import { VisibilityBadge } from "@/components/admin/product-status-badges";
import { useSortableDrag } from "@/components/admin/use-sortable-drag";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  replaceCategoriesFromServer,
  upsertCategoryInCache,
} from "@/features/products/category-repository";
import {
  createCategory,
  reorderCategories,
  setCategoryVisibility,
  updateCategory,
} from "@/features/products/category-service";
import { replaceProductsFromServer } from "@/features/products/product-repository";
import { useAdminCategoryList } from "@/features/products/use-catalog";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { runAdminMutation } from "@/lib/db/run-admin-mutation";
import { orderedIdsAfterDrop } from "@/lib/reorder/ordered-ids-after-drop";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/catalog";

async function refreshCatalogCache() {
  const catalog = await fetchCatalogAction();
  if (catalog.ok) {
    replaceCategoriesFromServer(catalog.data.categories);
    replaceProductsFromServer(catalog.data.products);
  }
}

export function AdminCategoriesClient() {
  const formId = useId();
  const categories = useAdminCategoryList();
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await runAdminMutation({
        db: () => createCategoryAction({ name, visible }),
        memory: () => createCategory({ name, visible }),
        onDbSuccess: (category) => upsertCategoryInCache(category),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setName("");
      setVisible(true);
      flash("تم إضافة التصنيف");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const saveEdit = async (id: string) => {
    const result = await runAdminMutation({
      db: () => updateCategoryAction(id, { name: editName }),
      memory: () => updateCategory(id, { name: editName }),
      onDbSuccess: (category) => upsertCategoryInCache(category),
    });
    if (!result.ok) {
      flash(result.message);
      return;
    }
    setEditingId(null);
    flash("تم تحديث التصنيف");
  };

  const toggleVisibility = async (category: Category) => {
    setBusyId(category.id);
    try {
      const result = await runAdminMutation({
        db: () =>
          setCategoryVisibilityAction(category.id, !category.visible),
        memory: () => setCategoryVisibility(category.id, !category.visible),
        onDbSuccess: (next) => upsertCategoryInCache(next),
      });
      flash(result.ok ? "تم تحديث حالة التصنيف" : result.message);
    } finally {
      setBusyId(null);
    }
  };

  const onReorderDrop = (sourceId: string, targetId: string) => {
    const next = orderedIdsAfterDrop(
      categories.map((c) => c.id),
      sourceId,
      targetId,
    );
    if (!next) return;
    void (async () => {
      setReorderBusy(true);
      try {
        const result = await runAdminMutation({
          db: () => reorderCategoriesAction(next),
          memory: () => reorderCategories(next),
          onDbSuccess: async () => {
            await refreshCatalogCache();
          },
        });
        flash(result.ok ? "تم تحديث ترتيب التصنيفات" : result.message);
      } finally {
        setReorderBusy(false);
      }
    })();
  };

  const sortable = useSortableDrag({
    disabled: reorderBusy || editingId != null,
    onDropReorder: onReorderDrop,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center gap-2 text-sm font-medium text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <ArrowRight className="size-4" aria-hidden />
          رجوع للمنتجات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">التصنيفات</h1>
        <p className="mt-1 text-sm text-text-muted">
          ترتيب وظهور تصنيفات منيو كلشي طيب — اسحب الصفوف لإعادة الترتيب
        </p>
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

      <form
        onSubmit={onCreate}
        className="space-y-3 rounded-lg border border-border bg-surface-elevated p-4"
      >
        <h2 className="text-sm font-semibold text-text">إضافة تصنيف</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor={`${formId}-name`} className="typo-label text-text">
              الاسم <span className="text-danger">*</span>
            </label>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
              autoComplete="off"
            />
          </div>
          <Checkbox
            id={`${formId}-visible`}
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            label="ظاهر"
            className="sm:mb-2"
          />
          <Button
            type="submit"
            startIcon={<Plus />}
            loading={submitting}
            disabled={submitting}
          >
            إضافة تصنيف
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tags />}
          title="ماكو تصنيفات حالياً"
          description="أضف تصنيفاً أولاً قبل ربط المنتجات."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">
                قائمة التصنيفات — اسحب الصف لإعادة الترتيب
              </caption>
              <thead className="bg-surface-warm text-start">
                <tr>
                  <th scope="col" className="w-10 px-2 py-3">
                    <span className="sr-only">ترتيب</span>
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    التصنيف
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    الظهور
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    الترتيب
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    عدد المنتجات
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const drag = sortable.itemProps(category.id);
                  return (
                    <tr
                      key={category.id}
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
                        {editingId === category.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              aria-label={`تعديل اسم ${category.name}`}
                              className="max-w-xs"
                            />
                            <Button
                              size="sm"
                              onClick={() => void saveEdit(category.id)}
                            >
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                            onClick={() => startEdit(category)}
                          >
                            {category.name}
                          </button>
                        )}
                        <p className="typo-caption mt-1 text-text-muted">
                          حُدّث {formatIraqDateTime(category.updatedAt)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <VisibilityBadge visible={category.visible} />
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {category.sortOrder}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {category.productCount}
                      </td>
                      <td className="px-3 py-3">
                        <IconButton
                          aria-label={
                            category.visible
                              ? `إخفاء ${category.name}`
                              : `إظهار ${category.name}`
                          }
                          icon={category.visible ? <EyeOff /> : <Eye />}
                          size="sm"
                          variant="ghost"
                          disabled={busyId === category.id || reorderBusy}
                          onClick={() => void toggleVisibility(category)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {categories.map((category) => {
              const drag = sortable.itemProps(category.id);
              return (
                <li
                  key={category.id}
                  {...drag}
                  className={sortable.cardClassName(
                    category.id,
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
                      {editingId === category.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            aria-label={`تعديل اسم ${category.name}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => void saveEdit(category.id)}
                            >
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="text-base font-semibold text-brand-primary"
                          onClick={() => startEdit(category)}
                        >
                          {category.name}
                        </button>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <VisibilityBadge visible={category.visible} />
                        <span className="text-xs text-text-muted">
                          ترتيب {category.sortOrder}
                        </span>
                        <span className="text-xs text-text-muted">
                          {category.productCount} منتج
                        </span>
                      </div>
                      <div className="mt-3">
                        <IconButton
                          aria-label={
                            category.visible
                              ? `إخفاء ${category.name}`
                              : `إظهار ${category.name}`
                          }
                          icon={category.visible ? <EyeOff /> : <Eye />}
                          size="sm"
                          variant="outline"
                          disabled={busyId === category.id || reorderBusy}
                          onClick={() => void toggleVisibility(category)}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
