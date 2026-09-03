/**
 * Instagram Reel URL helpers — pure.
 */

const IG_REEL =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?/i;

export function isValidInstagramReelUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return false;
    return IG_REEL.test(u.href);
  } catch {
    return false;
  }
}

export function normalizeInstagramReelUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!isValidInstagramReelUrl(trimmed)) return null;
  const u = new URL(trimmed);
  u.search = "";
  u.hash = "";
  let href = u.toString();
  if (!href.endsWith("/")) href += "/";
  return href;
}
