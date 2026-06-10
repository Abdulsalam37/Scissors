import { describe, it, expect } from "vitest";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

describe("URL Validation Logic", () => {
  it("should accept valid https and http URLs", () => {
    expect(isValidUrl("https://google.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000/path")).toBe(true);
    expect(isValidUrl("https://subdomain.domain.co.uk/query?param=val")).toBe(true);
  });

  it("should reject URLs without protocol", () => {
    expect(isValidUrl("google.com")).toBe(false);
    expect(isValidUrl("www.google.com")).toBe(false);
  });

  it("should reject non-web protocols", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
    expect(isValidUrl("mailto:test@example.com")).toBe(false);
    expect(isValidUrl("file:///C:/local/path")).toBe(false);
  });

  it("should reject malformed inputs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("http//missing-colon")).toBe(false);
    expect(isValidUrl("https://")).toBe(false);
  });
});
