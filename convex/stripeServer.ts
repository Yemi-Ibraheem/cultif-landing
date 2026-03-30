import { mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Start Stripe product setup; returns requestId to pass to createStripeProduct action. */
export const startStripeProductSetup = mutation({
  args: {
    monthlyPrice: v.number(),
    annualPrice: v.number(),
    productName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.db.insert("stripeProductRequests", {
      userId,
      monthlyPrice: args.monthlyPrice,
      annualPrice: args.annualPrice,
      productName: args.productName,
      createdAt: Date.now(),
    });
  },
});

export const getStripeProductRequest = internalQuery({
  args: { requestId: v.id("stripeProductRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const completeStripeProductSetup = internalMutation({
  args: {
    requestId: v.id("stripeProductRequests"),
    userId: v.id("users"),
    stripeProductId: v.string(),
    stripePriceIdMonthly: v.string(),
    stripePriceIdAnnual: v.string(),
    monthlyPrice: v.number(),
    annualPrice: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeProductId: args.stripeProductId,
      stripePriceIdMonthly: args.stripePriceIdMonthly,
      stripePriceIdAnnual: args.stripePriceIdAnnual,
      monthlyPrice: args.monthlyPrice,
      annualPrice: args.annualPrice,
    });
    await ctx.db.delete(args.requestId);
  },
});

/** Internal: get current authenticated user's Stripe product IDs + userId. */
export const getCurrentChefProducts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user || !user.isChef) return null;
    return {
      userId,
      stripeProductId: user.stripeProductId,
      stripePriceIdMonthly: user.stripePriceIdMonthly,
      stripePriceIdAnnual: user.stripePriceIdAnnual,
    };
  },
});

/** Internal: update locally stored prices and new Stripe Price IDs after price update. */
export const updateStoredPricesAndIds = internalMutation({
  args: {
    userId: v.id("users"),
    monthlyPrice: v.number(),
    annualPrice: v.number(),
    stripePriceIdMonthly: v.string(),
    stripePriceIdAnnual: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      monthlyPrice: args.monthlyPrice,
      annualPrice: args.annualPrice,
      stripePriceIdMonthly: args.stripePriceIdMonthly,
      stripePriceIdAnnual: args.stripePriceIdAnnual,
    });
  },
});

/** One-time reset: clear stale Stripe product IDs from all chefs so they re-create fresh products. */
export const resetAllStripeProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (user.stripeProductId || user.stripePriceIdMonthly || user.stripePriceIdAnnual) {
        await ctx.db.patch(user._id, {
          stripeProductId: undefined,
          stripePriceIdMonthly: undefined,
          stripePriceIdAnnual: undefined,
          monthlyPrice: undefined,
          annualPrice: undefined,
        });
        count++;
      }
    }
    return { resetCount: count };
  },
});

/** Internal: get chef's Stripe product/price IDs for checkout. */
export const getChefStripeProducts = internalQuery({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.chefId);
    if (!user) return null;
    return {
      stripeProductId: user.stripeProductId,
      stripePriceIdMonthly: user.stripePriceIdMonthly,
      stripePriceIdAnnual: user.stripePriceIdAnnual,
    };
  },
});

/** Internal: get current user's ID for checkout (customer creation). */
export const getCurrentUserForCheckout = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return { userId: userId as string };
  },
});
