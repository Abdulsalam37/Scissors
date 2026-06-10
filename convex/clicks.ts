import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordClick = mutation({
  args: {
    linkId: v.id("links"),
    timestamp: v.number(),
    country: v.string(),
    referrer: v.string(),
    device: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Insert click details
    await ctx.db.insert("clicks", {
      linkId: args.linkId,
      timestamp: args.timestamp,
      country: args.country,
      referrer: args.referrer,
      device: args.device,
    });

    // 2. Increment click count on the link
    const link = await ctx.db.get(args.linkId);
    if (link) {
      await ctx.db.patch(args.linkId, {
        clickCount: link.clickCount + 1,
      });
    }
  },
});

export const getLinkClicks = query({
  args: { linkId: v.id("links") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const link = await ctx.db.get(args.linkId);
    if (!link) {
      throw new Error("Link not found");
    }

    // Secure click access to the link owner
    if (link.userId !== identity.subject) {
      throw new Error("Unauthorized access to this link's analytics");
    }

    return await ctx.db
      .query("clicks")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .order("asc")
      .collect();
  },
});
