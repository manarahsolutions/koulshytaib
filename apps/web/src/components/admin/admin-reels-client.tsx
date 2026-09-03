"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import {
  createReelAction,
  deleteReelAction,
  listReelsAction,
  moveReelAction,
  setReelActiveAction,
} from "@/app/actions/backend";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReelRecord } from "@/features/reels/db-reel-repository";
import { useProducts } from "@/features/products/use-catalog";

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
        productId: productId || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setTitle("");
      setUrl("");
      setProductId("");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="الريلز"
        description="أضف روابط إنستغرام ريلز — بدون رفع فيديو. الظاهر للزبون هو المفعّل فقط."
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
          {reels.map((r) => (
            <li key={r.id}>
              <AdminPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy">{r.title}</p>
                  <Link
                    href={r.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="typo-caption break-all text-brand-primary underline-offset-2 hover:underline"
                    dir="ltr"
                  >
                    {r.instagramUrl}
                  </Link>
                  <p className="typo-caption mt-1 text-text-muted">
                    {r.active ? "فعّال" : "معطّل"}
                    {r.productId ? " · مربوط بمنتج" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void (async () => {
                        setBusy(true);
                        await moveReelAction(r.id, "up");
                        await refresh();
                        setBusy(false);
                      })()
                    }
                  >
                    أعلى
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void (async () => {
                        setBusy(true);
                        await moveReelAction(r.id, "down");
                        await refresh();
                        setBusy(false);
                      })()
                    }
                  >
                    أسفل
                  </Button>
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
          ))}
        </ul>
      )}
    </div>
  );
}
