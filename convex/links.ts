import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { customAlphabet } from "nanoid";

const RESERVED_SLUGS = ["admin", "api", "dashboard", "login"];
const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const generateRandomSlug = customAlphabet(alphabet, 6);

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Slug validation helper
function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > 50) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false;
  return true;
}

export const checkSlugAvailable = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.trim();
    if (!isValidSlug(slug)) {
      return false;
    }
    const existing = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return existing === null;
  },
});

export const createLink = mutation({
  args: {
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const originalUrl = args.originalUrl.trim();
    if (!isValidUrl(originalUrl)) {
      throw new Error("Invalid original URL. Must start with http:// or https://");
    }

    let slug = "";
    if (args.customSlug) {
      slug = args.customSlug.trim();
      if (!isValidSlug(slug)) {
        throw new Error("Invalid custom slug. Must be 3-50 characters and contain only letters, numbers, and hyphens.");
      }
      const existing = await ctx.db
        .query("links")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (existing !== null) {
        throw new Error("Slug is already in use.");
      }
    } else {
      // Auto-generate a unique 6-character slug
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateRandomSlug();
        const existing = await ctx.db
          .query("links")
          .withIndex("by_slug", (q) => q.eq("slug", candidate))
          .first();
        if (existing === null) {
          slug = candidate;
          break;
        }
        attempts++;
      }
      if (!slug) {
        throw new Error("Failed to generate a unique slug. Please try again.");
      }
    }

    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity ? identity.subject : "anonymous";

    const newLinkId = await ctx.db.insert("links", {
      originalUrl,
      slug,
      userId,
      clickCount: 0,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
      expired: false,
    });

    return { id: newLinkId, slug };
  },
});

export const getLinkBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getUserLinks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const deleteLink = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const link = await ctx.db.get(args.id);
    if (!link) {
      throw new Error("Link not found");
    }

    if (link.userId !== identity.subject) {
      throw new Error("Unauthorized to delete this link");
    }

    // Delete the link
    await ctx.db.delete(args.id);

    // Clean up all clicks for this link
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.id))
      .collect();

    for (const click of clicks) {
      await ctx.db.delete(click._id);
    }

    return true;
  },
});

export const markAsExpired = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.id);
    if (!link) {
      throw new Error("Link not found");
    }
    await ctx.db.patch(args.id, { expired: true });
    return true;
  },
});
