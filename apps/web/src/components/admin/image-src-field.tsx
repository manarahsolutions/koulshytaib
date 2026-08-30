"use client";

import { useId, useState } from "react";
import { uploadAdminImageAction } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <label htmlFor={id} className="typo-label text-text">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/… أو /images/…"
        className="mt-1.5"
        autoComplete="off"
        dir="ltr"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          disabled={uploading}
          onClick={() => document.getElementById(fileId)?.click()}
        >
          رفع صورة
        </Button>
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
