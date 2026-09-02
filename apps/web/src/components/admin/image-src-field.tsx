"use client";

import { useId, useState } from "react";
import { uploadAdminImageAction } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";

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

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadAdminImageAction(fd);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onChange(result.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p id={id} className="typo-label text-text">
        {label}
      </p>
      <div
        className="mt-1.5 flex flex-wrap items-center gap-2"
        aria-labelledby={id}
      >
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
          {value.trim() ? "تغيير الصورة" : "رفع صورة من الجهاز"}
        </Button>
        {value.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => {
              setError(null);
              onChange("");
            }}
          >
            إزالة
          </Button>
        ) : null}
        <p className="text-xs text-text-muted">JPEG / PNG / WebP · حتى 2MB</p>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
