import { mutation } from "./_generated/server";
import { v } from "convex/values";

const LIMITS = {
  password: { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 },
  otp:      { maxAttempts: 5, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 },
  resend:   { maxAttempts: 3, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 },
  reset:    { maxAttempts: 3, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 },
} as const;

type LimitType = keyof typeof LIMITS;

export const checkRateLimit = mutation({
  args: { email: v.string(), type: v.string() },
  handler: async (ctx, { email, type }) => {
    const limitType = type as LimitType;
    const config = LIMITS[limitType];
    if (!config) return { allowed: true, retryAfterMs: 0 };

    const key = `${limitType}:${email.toLowerCase()}`;
    const now = Date.now();
    const existing = await ctx.db
      .query("appRateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { allowed: false, retryAfterMs: existing.lockedUntil - now };
    }

    if (!existing) {
      await ctx.db.insert("appRateLimits", {
        key,
        attempts: 1,
        windowStart: now,
      });
      return { allowed: true, retryAfterMs: 0 };
    }

    const windowExpired = now - existing.windowStart > config.windowMs;
    if (windowExpired) {
      await ctx.db.patch(existing._id, {
        attempts: 1,
        windowStart: now,
        lockedUntil: undefined,
      });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (existing.attempts >= config.maxAttempts) {
      const lockedUntil = now + config.lockoutMs;
      await ctx.db.patch(existing._id, { lockedUntil });
      return { allowed: false, retryAfterMs: config.lockoutMs };
    }

    await ctx.db.patch(existing._id, { attempts: existing.attempts + 1 });
    return { allowed: true, retryAfterMs: 0 };
  },
});

export const recordFailure = mutation({
  args: { email: v.string(), type: v.string() },
  handler: async (ctx, { email, type }) => {
    const limitType = type as LimitType;
    const config = LIMITS[limitType];
    if (!config) return;

    const key = `${limitType}:${email.toLowerCase()}`;
    const now = Date.now();
    const existing = await ctx.db
      .query("appRateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (!existing) {
      await ctx.db.insert("appRateLimits", {
        key,
        attempts: 1,
        windowStart: now,
      });
      return;
    }

    const windowExpired = now - existing.windowStart > config.windowMs;
    const newAttempts = windowExpired ? 1 : existing.attempts + 1;
    const patch: Record<string, unknown> = {
      attempts: newAttempts,
      windowStart: windowExpired ? now : existing.windowStart,
    };

    if (newAttempts >= config.maxAttempts) {
      patch.lockedUntil = now + config.lockoutMs;
    }

    await ctx.db.patch(existing._id, patch);
  },
});

export const clearRateLimit = mutation({
  args: { email: v.string(), type: v.string() },
  handler: async (ctx, { email, type }) => {
    const key = `${type}:${email.toLowerCase()}`;
    const existing = await ctx.db
      .query("appRateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
