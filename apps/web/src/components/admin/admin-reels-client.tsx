"use client";

import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  createReelAction,
  deleteReelAction,
  listReelsAction,
  reorderReelsAction,
  setReelActiveAction,
} from "@/app/actions/backend";
import { ImageSrcField } from "@/components/admin/image-src-field";
import { useSortableDrag } from "@/components/admin/use-sortable-drag";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReelRecord } from "@/features/reels/db-reel-repository";
import { useProducts } from "@/features/products/use-catalog";
import { orderedIdsAfterDrop } from "@/lib/reorder/ordered-ids-after-drop";
import { cn } from "@/lib/utils/cn";

export function AdminReelsClient({
  initial,
  canDelete,
}: {
  initial: ReelRecord[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const formId = useId();
  const products = useProducts();
  const [reels, setReels] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [productId, setProductId] = useState("");

  const refresh = async () => {
    const result = await listReelsAction();
    if (result.ok) setReels(result.data);
    router.refresh();
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await createReelAction({
        title,
        instagramUrl: url,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        productId: productId || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setTitle("");
      setUrl("");
      setThumbnailUrl("");
      setProductId("");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onReorderDrop = (sourceId: string, targetId: string) => {
    const next = orderedIdsAfterDrop(
      reels.map((r) => r.id),
      sourceId,
      targetId,
    );
    if (!next) return;
    // Optimistic UI while saving
    const byId = new Map(reels.map((r) => [r.id, r]));
    setReels(next.map((id) => byId.get(id)!).filter(Boolean));
    void (async () => {
      setBusy(true);
      const result = await reorderReelsAction(next);
      if (!result.ok) {
        setError(result.message);
        await refresh();
      } else {
        setReels(result.data);
      }
      setBusy(false);
    })();
  };

  const sortable = useSortableDrag({
    disabled: busy,
    onDropReorder: onReorderDrop,
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="الريلز"
        description="أضف روابط إنستغرام ريلز. اسحب البطاقة لإعادة الترتيب."
      />

      <AdminPanel>
        <form onSubmit={(e) => void onCreate(e)} className="space-y-3">
          <h2 className="text-base font-semibold text-brand-navy">ريل جديد</h2>
          <Input
            id={`${formId}-title`}
            placeholder="العنوان"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id={`${formId}-url`}
            placeholder="https://www.instagram.com/reel/…"
            dir="ltr"
            className="text-start"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <ImageSrcField
            label="صورة مصغّرة (اختياري — تُجلب من إنستغرام تلقائياً)"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            inputId={`${formId}-thumb`}
          />
          <Select
            id={`${formId}-product`}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">بدون ربط منتج</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Button type="submit" size="sm" loading={busy}>
            إضافة
          </Button>
        </form>
        {error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </AdminPanel>

      {reels.length === 0 ? (
        <p className="text-sm text-text-muted">ماكو ريلز بعد.</p>
      ) : (
        <ul className="space-y-3">
          {reels.map((r) => {
            const drag = sortable.itemProps(r.id);
            return (
              <li key={r.id} {...drag} className={cn(drag.className)}>
                <AdminPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="mt-1 inline-flex shrink-0 cursor-grab text-text-muted active:cursor-grabbing"
                      aria-hidden
                      title="اسحب لإعادة الترتيب"
                    >
                      <GripVertical className="size-4" />
                    </span>
                    {r.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.thumbnailUrl}
                        alt=""
                        className="size-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-14 shrink-0 rounded-lg bg-surface-warm" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-navy">{r.title}</p>
                      <Link
                        href={r.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="typo-caption break-all text-brand-primary underline-offset-2 hover:underline"
                        dir="ltr"
                        onClick={(e) => {
                          if (sortable.dragId) e.preventDefault();
                        }}
                      >
                        {r.instagramUrl}
                      </Link>
                      <p className="typo-caption mt-1 text-text-muted">
                        {r.active ? "فعّال" : "معطّل"}
                        {r.productId ? " · مربوط بمنتج" : ""}
                        {r.thumbnailUrl
                          ? " · فيه صورة مصغّرة"
                          : " · بدون صورة مصغّرة"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        void (async () => {
                          setBusy(true);
                          await setReelActiveAction(r.id, !r.active);
                          await refresh();
                          setBusy(false);
                        })()
                      }
                    >
                      {r.active ? "تعطيل" : "تفعيل"}
                    </Button>
                    {canDelete ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                          void (async () => {
                            if (!confirm("حذف هذا الريل؟")) return;
                            setBusy(true);
                            await deleteReelAction(r.id);
                            await refresh();
                            setBusy(false);
                          })()
                        }
                      >
                        حذف
                      </Button>
                    ) : null}
                  </div>
                </AdminPanel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
