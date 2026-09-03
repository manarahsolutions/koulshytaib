"use client";

import { useEffect, useId, useState } from "react";
import {
  deleteAdminImageAction,
  uploadAdminImageAction,
} from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import { prepareImageForUpload } from "@/lib/images/prepare-image";

export type ImageSrcFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  inputId?: string;
};

export function ImageSrcField({
  label,
  value,
  onChange,
  inputId,
}: ImageSrcFieldProps) {
  const autoId = useId();
  const id = inputId ?? autoId;
  const fileId = `${id}-file`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const displaySrc = localPreview || value.trim() || null;

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    const previous = value.trim();
    try {
      const prepared = await prepareImageForUpload(file);
      if (!prepared.ok) {
        setError(prepared.message);
        return;
      }
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return prepared.previewUrl;
      });

      const fd = new FormData();
      fd.set("file", prepared.file);
      const result = await uploadAdminImageAction(fd);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onChange(result.url);
      if (previous && previous !== result.url) {
        void deleteAdminImageAction(previous);
      }
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    const previous = value.trim();
    setError(null);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    onChange("");
    if (previous) void deleteAdminImageAction(previous);
  };

  return (
    <div>
      <p id={id} className="typo-label text-text">
        {label}
      </p>
      {displaySrc ? (
        <div className="relative mt-1.5 aspect-[4/3] max-w-xs overflow-hidden rounded-xl border border-border-soft bg-surface-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displaySrc}
            alt=""
            className="size-full object-cover"
          />
        </div>
      ) : null}
      <div
        className="mt-2 flex flex-wrap items-center gap-2"
        aria-labelledby={id}
      >
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            void onFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          disabled={uploading}
          onClick={() => document.getElementById(fileId)?.click()}
        >
          {value.trim() || localPreview ? "تغيير الصورة" : "رفع صورة من الجهاز"}
        </Button>
        {value.trim() || localPreview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={clear}
          >
            إزالة
          </Button>
        ) : null}
        <p className="text-xs text-text-muted">
          JPEG / PNG / WebP · حتى 2MB (يُضغط تلقائياً إن لزم)
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
