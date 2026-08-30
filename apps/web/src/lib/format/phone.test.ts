import { describe, expect, it } from "vitest";
import {
  normalizeIraqiPhone,
  isValidIraqiPhone,
} from "@/lib/format/phone";
import { iraqiLocalToE164 } from "@/features/notifications/whatsapp-deeplink";

describe("normalizeIraqiPhone", () => {
  it("accepts local 07 form", () => {
    expect(normalizeIraqiPhone("07501234567")).toBe("07501234567");
  });

  it("normalizes +964 and 964 prefixes", () => {
    expect(normalizeIraqiPhone("+9647501234567")).toBe("07501234567");
    expect(normalizeIraqiPhone("9647501234567")).toBe("07501234567");
  });

  it("normalizes 10-digit leading 7", () => {
    expect(normalizeIraqiPhone("7501234567")).toBe("07501234567");
  });

  it("rejects invalid shapes", () => {
    expect(normalizeIraqiPhone("123")).toBeNull();
    expect(normalizeIraqiPhone("06501234567")).toBeNull();
    expect(isValidIraqiPhone("")).toBe(false);
  });
});

describe("iraqiLocalToE164", () => {
  it("maps 07… to 9647…", () => {
    expect(iraqiLocalToE164("07501234567")).toBe("9647501234567");
  });

  it("returns null for invalid local", () => {
    expect(iraqiLocalToE164("bad")).toBeNull();
  });
});
