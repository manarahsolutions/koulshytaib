/**
 * Client-side image compress before admin upload.
 */

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_EDGE = 1600;

export type PrepareImageResult =
  | { ok: true; file: File; previewUrl: string }
  | { ok: false; message: string };

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function prepareImageForUpload(
  file: File,
): Promise<PrepareImageResult> {
  if (!ALLOWED.has(file.type)) {
    return { ok: false, message: "الصيغة المسموحة: JPEG أو PNG أو WebP" };
  }

  const previewUrl = URL.createObjectURL(file);

  if (file.size <= MAX_BYTES && file.size < 900_000) {
    return { ok: true, file, previewUrl };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (file.size > MAX_BYTES) {
        URL.revokeObjectURL(previewUrl);
        return { ok: false, message: "حجم الصورة أكبر من 2 ميغابايت" };
      }
      return { ok: true, file, previewUrl };
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob) {
      if (file.size > MAX_BYTES) {
        URL.revokeObjectURL(previewUrl);
        return { ok: false, message: "حجم الصورة أكبر من 2 ميغابايت" };
      }
      return { ok: true, file, previewUrl };
    }
    if (blob.size > MAX_BYTES) {
      URL.revokeObjectURL(previewUrl);
      return {
        ok: false,
        message: "حتى بعد الضغط، الصورة أكبر من 2 ميغابايت — اختَر صورة أصغر",
      };
    }
    URL.revokeObjectURL(previewUrl);
    const compressed = new File(
      [blob],
      file.name.replace(/\.\w+$/, "") + ".webp",
      { type: "image/webp" },
    );
    return {
      ok: true,
      file: compressed,
      previewUrl: URL.createObjectURL(compressed),
    };
  } catch {
    if (file.size > MAX_BYTES) {
      URL.revokeObjectURL(previewUrl);
      return { ok: false, message: "حجم الصورة أكبر من 2 ميغابايت" };
    }
    return { ok: true, file, previewUrl };
  }
}
