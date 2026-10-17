"use client";

import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  deleteAdminImageAction,
  uploadAdminImageAction,
} from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import { prepareImageForUpload } from "@/lib/images/prepare-image";
import { cn } from "@/lib/utils/cn";

export const MAX_PRODUCT_IMAGES = 8;

export type ProductImagesFieldProps = {
  label: string;
  /** Ordered image URLs — the first one is the cover shown on cards. */
  value: string[];
  onChange: (urls: string[]) => void;
};

export function ProductImagesField({
  label,
  value,
  onChange,
}: ProductImagesFieldProps) {
  const id = useId();
  const fileId = `${id}-file`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only images uploaded in this form session are deleted from storage on
  // removal; saved ones stay until the product is saved without them.
  const uploadedHere = useRef(new Set<string>());

  const remaining = MAX_PRODUCT_IMAGES - value.length;

  const onFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    if (files.length > remaining) {
      setError(`الحد الأقصى ${MAX_PRODUCT_IMAGES} صور للمنتج`);
      files = files.slice(0, Math.max(remaining, 0));
      if (files.length === 0) return;
    }
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of files) {
        const prepared = await prepareImageForUpload(file);
        if (!prepared.ok) {
          setError(prepared.message);
          continue;
        }
        URL.revokeObjectURL(prepared.previewUrl);
        const fd = new FormData();
        fd.set("file", prepared.file);
        const result = await uploadAdminImageAction(fd);
        if (!result.ok) {
          setError(result.message);
          continue;
        }
        uploadedHere.current.add(result.url);
        added.push(result.url);
      }
      if (added.length) onChange([...value, ...added]);
    } finally {
      setUploading(false);
    }
  };

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
    if (uploadedHere.current.has(url)) {
      uploadedHere.current.delete(url);
      void deleteAdminImageAction(url);
    }
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <p id={id} className="typo-label text-text">
        {label}
      </p>
      <p className="mt-0.5 text-xs text-text-muted">
        أول صورة هي الرئيسية وتظهر بالمنيو، والباقي تظهر بصفحة المنتج
      </p>

      {value.length > 0 ? (
        <ul
          className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"
          aria-labelledby={id}
        >
          {value.map((url, index) => (
            <li
              key={url}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-surface-warm",
                index === 0
                  ? "border-brand-primary ring-2 ring-brand-primary/30"
                  : "border-border-soft",
              )}
            >
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </div>
              {index === 0 ? (
                <span className="absolute start-2 top-2 rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-on-dark">
                  الرئيسية
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => remove(url)}
                disabled={uploading}
                className="absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-surface-elevated/95 text-text shadow-sm hover:text-danger focus-visible:outline-2 focus-visible:outline-focus-ring"
                aria-label={`إزالة الصورة ${index + 1}`}
              >
                <X className="size-4" aria-hidden />
              </button>
              <div className="flex items-center justify-between gap-1 border-t border-border-soft bg-surface-elevated px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex size-8 items-center justify-center rounded-md text-text-muted hover:text-text disabled:opacity-30"
                  aria-label="تقديم الصورة"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
                {index !== 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-text-muted hover:text-brand-primary"
                  >
                    <Star className="size-3.5" aria-hidden />
                    اجعلها رئيسية
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="inline-flex size-8 items-center justify-center rounded-md text-text-muted hover:text-text disabled:opacity-30"
                  aria-label="تأخير الصورة"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void onFiles(files);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          disabled={uploading || remaining <= 0}
          onClick={() => document.getElementById(fileId)?.click()}
        >
          {value.length ? "إضافة صور" : "رفع صور من الجهاز"}
        </Button>
        <p className="text-xs text-text-muted">
          JPEG / PNG / WebP · حتى {MAX_PRODUCT_IMAGES} صور · كل صورة حتى 2MB
          (تُضغط تلقائياً إن لزم)
        </p>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
