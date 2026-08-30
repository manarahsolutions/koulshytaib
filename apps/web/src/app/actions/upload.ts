/**
 * Admin image upload — local public/uploads or Vercel Blob.
 */

"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/features/admin-auth/authorization";
import { AuthError } from "@/features/admin-auth/types";
import { logServerError, toUserMessage } from "@/lib/db/errors";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
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
      const blob = await put(`uploads/${filename}`, bytes, {
        access: "public",
        contentType: file.type,
        token,
      });
      return { ok: true, url: blob.url };
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
