import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    originalUrl: v.string(),
    slug: v.string(),
    userId: v.string(), // Clerk user ID or "anonymous"
    clickCount: v.number(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // Unix timestamp in ms
    expired: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_userId", ["userId"]),

  clicks: defineTable({
    linkId: v.id("links"),
    timestamp: v.number(),
    country: v.string(),
    referrer: v.string(),
    device: v.string(),
  })
    .index("by_linkId", ["linkId"])
    .index("by_timestamp", ["timestamp"]),
});
