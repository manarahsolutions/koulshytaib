/**
 * Admin image upload — local public/uploads or Vercel Blob.
 */

"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
import { requireAdmin } from "@/features/admin-auth/authorization";
import { AuthError } from "@/features/admin-auth/types";
import { logServerError, toUserMessage } from "@/lib/db/errors";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const BLOB_REQUIRED_MESSAGE =
  "رفع الصور على السيرفر يحتاج إعداد Vercel Blob (اربط Blob Store بالمشروع أو عيّن BLOB_READ_WRITE_TOKEN).";

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function requiresBlobStorage(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

/** OIDC (BLOB_STORE_ID) or a static RW token — do not pass token explicitly so OIDC can win. */
function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_STORE_ID?.trim() ||
      process.env.BLOB_READ_WRITE_TOKEN?.trim(),
  );
}

function normalizeReadWriteToken(
  raw: string | undefined,
): string | undefined {
  const token = raw?.trim().replace(/^["']|["']$/g, "");
  if (!token) return undefined;
  if (!token.startsWith("vercel_blob_rw_")) return undefined;
  return token;
}

export async function uploadAdminImageAction(
  formData: FormData,
): Promise<UploadImageResult> {
  try {
    if (!isDatabaseConfigured()) {
      return { ok: false, message: "قاعدة البيانات غير مهيأة" };
    }
    await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: "اختَر صورة للرفع" };
    }
    if (!ALLOWED.has(file.type)) {
      return { ok: false, message: "الصيغة المسموحة: JPEG أو PNG أو WebP" };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, message: "حجم الصورة أكبر من 2 ميغابايت" };
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${createOpaqueId("img")}.${extForMime(file.type)}`;

    if (hasBlobCredentials()) {
      const rw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
      if (
        rw &&
        !process.env.BLOB_STORE_ID?.trim() &&
        !normalizeReadWriteToken(rw)
      ) {
        return {
          ok: false,
          message:
            "قيمة BLOB_READ_WRITE_TOKEN غير صحيحة — لازم تبدأ بـ vercel_blob_rw_ (انسخها من Storage → Blob).",
        };
      }
      try {
        // Prefer SDK auth resolution: OIDC + BLOB_STORE_ID on Vercel, else env RW token.
        // Do not pass `token` — an explicit token always overrides OIDC.
        const blob = await put(`uploads/${filename}`, bytes, {
          access: "public",
          contentType: file.type || undefined,
          addRandomSuffix: true,
        });
        return { ok: true, url: blob.url };
      } catch (blobError) {
        logServerError("uploadAdminImage.blob", blobError);
        const detail =
          blobError instanceof Error
            ? blobError.message.replace(/^Vercel Blob:\s*/i, "").trim()
            : "";
        return {
          ok: false,
          message: detail
            ? `فشل رفع Blob: ${detail}`
            : "ما قدرنا نرفع الصورة على التخزين السحابي. تأكد من ربط Blob Store ثم أعد نشر المشروع (Redeploy).",
        };
      }
    }

    if (requiresBlobStorage()) {
      return { ok: false, message: BLOB_REQUIRED_MESSAGE };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);
    return { ok: true, url: `/uploads/${filename}` };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.userMessage };
    }
    logServerError("uploadAdminImage", error);
    return { ok: false, message: toUserMessage(error) };
  }
}

/** Best-effort cleanup when replacing/removing an admin image. */
export async function deleteAdminImageAction(
  url: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await requireAdmin();
    const trimmed = url.trim();
    if (!trimmed) return { ok: true };

    if (hasBlobCredentials() && /^https?:\/\//i.test(trimmed)) {
      try {
        await del(trimmed);
      } catch (error) {
        logServerError("deleteAdminImage.blob", error);
      }
      return { ok: true };
    }

    if (trimmed.startsWith("/uploads/")) {
      const name = path.basename(trimmed);
      if (name && name !== "." && name !== "..") {
        try {
          await unlink(path.join(process.cwd(), "public", "uploads", name));
        } catch {
          // missing file is fine
        }
      }
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.userMessage };
    }
    return { ok: true };
  }
}
