import { describe, it, expect } from "vitest";

interface MockLink {
  expired: boolean;
  expiresAt?: number;
}

function checkExpired(link: MockLink, currentTimestamp: number): boolean {
  if (link.expired) return true;
  if (link.expiresAt && currentTimestamp > link.expiresAt) return true;
  return false;
}

describe("Link Expiration Logic", () => {
  it("should mark link active if expired is false and no expiresAt is set", () => {
    const link: MockLink = { expired: false };
    expect(checkExpired(link, Date.now())).toBe(false);
  });

  it("should mark link expired if explicit expired flag is true", () => {
    const link: MockLink = { expired: true };
    expect(checkExpired(link, Date.now())).toBe(true);
  });

  it("should mark link active if expiration timestamp is in the future", () => {
    const now = Date.now();
    const link: MockLink = { expired: false, expiresAt: now + 5000 };
    expect(checkExpired(link, now)).toBe(false);
  });

  it("should mark link expired if expiration timestamp is in the past", () => {
    const now = Date.now();
    const link: MockLink = { expired: false, expiresAt: now - 1000 };
    expect(checkExpired(link, now)).toBe(true);
  });

  it("should handle boundary conditions exactly at expiration time", () => {
    const now = Date.now();
    const link: MockLink = { expired: false, expiresAt: now };
    // Exactly at expiration time it is active, but a millisecond after it is expired
    expect(checkExpired(link, now)).toBe(false);
    expect(checkExpired(link, now + 1)).toBe(true);
  });
});
