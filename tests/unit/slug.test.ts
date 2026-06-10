import { describe, it, expect } from "vitest";

const RESERVED_SLUGS = ["admin", "api", "dashboard", "login"];

function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 50) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false;
  return true;
}

describe("Slug Validation Logic", () => {
  it("should accept valid slugs", () => {
    expect(isValidSlug("valid-slug")).toBe(true);
    expect(isValidSlug("slug123")).toBe(true);
    expect(isValidSlug("abc")).toBe(true);
  });

  it("should reject slugs that are too short", () => {
    expect(isValidSlug("ab")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  it("should reject slugs that are too long", () => {
    const longSlug = "a".repeat(51);
    expect(isValidSlug(longSlug)).toBe(false);
  });

  it("should reject invalid characters", () => {
    expect(isValidSlug("slug_with_underscores")).toBe(false);
    expect(isValidSlug("slug.with.dots")).toBe(false);
    expect(isValidSlug("slug with spaces")).toBe(false);
    expect(isValidSlug("slug@123")).toBe(false);
  });

  it("should reject reserved slugs case-insensitively", () => {
    expect(isValidSlug("admin")).toBe(false);
    expect(isValidSlug("api")).toBe(false);
    expect(isValidSlug("Dashboard")).toBe(false);
    expect(isValidSlug("LOGIN")).toBe(false);
  });
});
