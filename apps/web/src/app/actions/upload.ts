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
  "رفع الصور على السيرفر يحتاج إعداد Vercel Blob (BLOB_READ_WRITE_TOKEN).";

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

    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (token) {
      try {
        const blob = await put(`uploads/${filename}`, bytes, {
          access: "public",
          contentType: file.type,
          token,
        });
        return { ok: true, url: blob.url };
      } catch (blobError) {
        logServerError("uploadAdminImage.blob", blobError);
        return {
          ok: false,
          message:
            "ما قدرنا نرفع الصورة على التخزين السحابي. تأكد من توكن Blob.",
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

    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (token && /^https?:\/\//i.test(trimmed)) {
      try {
        await del(trimmed, { token });
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
