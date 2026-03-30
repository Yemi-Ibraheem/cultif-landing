import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyConnectAccountMapping = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db
      .query("connectAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getAllConnectProductMappings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("connectProducts").collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getAllConnectAccounts = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("connectAccounts").collect();
    return rows.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const upsertMyConnectAccountMapping = mutation({
  args: {
    stripeAccountId: v.string(),
    displayName: v.string(),
    contactEmail: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("connectAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeAccountId: args.stripeAccountId,
        displayName: args.displayName,
        contactEmail: args.contactEmail,
        country: args.country,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("connectAccounts", {
      userId,
      stripeAccountId: args.stripeAccountId,
      displayName: args.displayName,
      contactEmail: args.contactEmail,
      country: args.country,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const insertConnectProductMapping = mutation({
  args: {
    stripeProductId: v.string(),
    stripeDefaultPriceId: v.optional(v.string()),
    connectedAccountId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    unitAmount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("connectProducts", {
      stripeProductId: args.stripeProductId,
      stripeDefaultPriceId: args.stripeDefaultPriceId,
      connectedAccountId: args.connectedAccountId,
      name: args.name,
      description: args.description,
      unitAmount: args.unitAmount,
      currency: args.currency,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getConnectProductById = internalQuery({
  args: { productDocId: v.id("connectProducts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productDocId);
  },
});

export const getMyConnectAccountMappingInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connectAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsertConnectAccountByUserId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeAccountId: v.string(),
    displayName: v.string(),
    contactEmail: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connectAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeAccountId: args.stripeAccountId,
        displayName: args.displayName,
        contactEmail: args.contactEmail,
        country: args.country,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("connectAccounts", {
      userId: args.userId,
      stripeAccountId: args.stripeAccountId,
      displayName: args.displayName,
      contactEmail: args.contactEmail,
      country: args.country,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const insertConnectProductMappingInternal = internalMutation({
  args: {
    userId: v.id("users"),
    stripeProductId: v.string(),
    stripeDefaultPriceId: v.optional(v.string()),
    connectedAccountId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    unitAmount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("connectProducts", {
      stripeProductId: args.stripeProductId,
      stripeDefaultPriceId: args.stripeDefaultPriceId,
      connectedAccountId: args.connectedAccountId,
      name: args.name,
      description: args.description,
      unitAmount: args.unitAmount,
      currency: args.currency,
      createdByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const insertConnectWebhookEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    stripeAccountId: v.optional(v.string()),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("connectWebhookEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      stripeAccountId: args.stripeAccountId,
      payload: args.payload,
      createdAt: Date.now(),
    });
  },
});

