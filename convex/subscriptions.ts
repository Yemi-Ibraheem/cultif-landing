import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// Check if the current user is subscribed to a chef (payment-backed; active and not expired)
export const isSubscribed = query({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return false;

    if (userId === args.chefId) return true;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_and_chef", (q) =>
        q.eq("userId", userId).eq("chefId", args.chefId)
      )
      .first();

    if (sub === null) return false;
    const status = sub.status ?? "active";
    const periodEnd = sub.currentPeriodEnd;
    return status === "active" && (periodEnd == null || periodEnd > Date.now());
  },
});

// Get subscriber count for a chef
export const getSubscriberCount = query({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_chef", (q) => q.eq("chefId", args.chefId))
      .collect();
    return subs.length;
  },
});

/** Called from Stripe webhook: upsert subscription when invoice.paid. */
export const setSubscriptionFromWebhook = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    customerExternalId: v.string(),
    chefId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    plan: v.optional(v.union(v.literal("monthly"), v.literal("annual"))),
  },
  handler: async (ctx, args) => {
    const chefId = args.chefId as Id<"users">;
    const userId = args.customerExternalId as Id<"users">;

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    const patch = {
      status: args.status,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
      currentPeriodEnd: args.currentPeriodEnd,
      plan: args.plan,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      const byUserAndChef = await ctx.db
        .query("subscriptions")
        .withIndex("by_user_and_chef", (q) =>
          q.eq("userId", userId).eq("chefId", chefId)
        )
        .first();
      if (byUserAndChef) {
        await ctx.db.patch(byUserAndChef._id, patch);
      } else {
        await ctx.db.insert("subscriptions", {
          userId,
          chefId,
          subscribedAt: Date.now(),
          ...patch,
        });
      }
    }
  },
});

/** Called from Stripe webhook: update status for subscription.updated / subscription.deleted. */
export const updateSubscriptionStatusByStripeId = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
    if (sub) {
      const patch: Record<string, unknown> = { status: args.status };
      if (args.currentPeriodEnd !== undefined) {
        patch.currentPeriodEnd = args.currentPeriodEnd;
      }
      await ctx.db.patch(sub._id, patch);
    }
  },
});

// Unsubscribe from a chef (admin/testing; Stripe cancellations are handled via webhook)
export const unsubscribe = mutation({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_and_chef", (q) =>
        q.eq("userId", userId).eq("chefId", args.chefId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
