/**
 * Best-effort Instagram reel thumbnail resolution (no Graph API token).
 */

import { put } from "@vercel/blob";
import { normalizeInstagramReelUrl } from "@/features/reels/instagram-url";

function reelShortcode(permalink: string): string | null {
  const match = permalink.match(/\/reel(?:s)?\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_STORE_ID?.trim() ||
      process.env.BLOB_READ_WRITE_TOKEN?.trim(),
  );
}

/**
 * Resolves a direct image URL for a public Instagram reel via the legacy
 * `/p/{code}/media/?size=l` redirect. Returns null when Instagram blocks it.
 */
export async function fetchInstagramReelThumbnailUrl(
  instagramUrl: string,
): Promise<string | null> {
  const permalink = normalizeInstagramReelUrl(instagramUrl);
  if (!permalink) return null;
  const code = reelShortcode(permalink);
  if (!code) return null;

  const mediaUrl = `https://www.instagram.com/p/${encodeURIComponent(code)}/media/?size=l`;
  try {
    const res = await fetch(mediaUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KoulshyTaib/1.0; +https://koulshy-taib-web.vercel.app)",
        Accept: "image/*,*/*",
      },
      cache: "no-store",
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")?.trim();
      if (location && /^https?:\/\//i.test(location)) return location;
    }

    if (res.ok && res.headers.get("content-type")?.startsWith("image/")) {
      return mediaUrl;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Prefer copying the Instagram still into Vercel Blob; fall back to CDN URL.
 */
export async function storeReelThumbnail(
  instagramUrl: string,
): Promise<string | null> {
  const source = await fetchInstagramReelThumbnailUrl(instagramUrl);
  if (!source) return null;

  if (!hasBlobCredentials()) return source;

  try {
    const res = await fetch(source, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KoulshyTaib/1.0; +https://koulshy-taib-web.vercel.app)",
        Accept: "image/*,*/*",
      },
    });
    if (!res.ok) return source;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.byteLength < 100) return source;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const blob = await put(`reels/thumbs/${Date.now()}.${ext}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });
    return blob.url;
  } catch {
    return source;
  }
}
