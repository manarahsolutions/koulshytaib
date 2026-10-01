import { describe, expect, it } from "vitest";
import {
  isValidInstagramReelUrl,
  normalizeInstagramReelUrl,
  toInstagramEmbedUrl,
} from "@/features/reels/instagram-url";

describe("instagram reel url", () => {
  it("accepts reel and reels paths", () => {
    expect(
      isValidInstagramReelUrl("https://www.instagram.com/reel/AbC123_/"),
    ).toBe(true);
    expect(
      isValidInstagramReelUrl("https://instagram.com/reels/AbC123"),
    ).toBe(true);
  });

  it("rejects non-reel urls", () => {
    expect(isValidInstagramReelUrl("https://instagram.com/p/AbC123/")).toBe(
      false,
    );
    expect(isValidInstagramReelUrl("https://example.com/reel/x")).toBe(false);
  });

  it("normalizes query/hash", () => {
    expect(
      normalizeInstagramReelUrl(
        "https://www.instagram.com/reel/AbC123/?igsh=1#x",
      ),
    ).toBe("https://www.instagram.com/reel/AbC123/");
  });

  it("builds embed url", () => {
    expect(
      toInstagramEmbedUrl("https://www.instagram.com/reel/AbC123/?igsh=1"),
    ).toBe("https://www.instagram.com/reel/AbC123/embed");
  });
});
