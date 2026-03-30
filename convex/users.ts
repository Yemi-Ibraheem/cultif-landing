import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user — public profile (no email/phone).
// Use getMyPrivateProfile for settings pages that need email/phone.
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const { email, phone, phoneVerificationTime, emailVerificationTime, ...publicFields } = user;
    return publicFields;
  },
});

// Get current user's full private profile (includes email/phone for settings).
// Only returns the caller's OWN data — never another user's.
export const getMyPrivateProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

// Get user by ID — returns public profile only (never email/phone/PII)
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (callerId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      avatar: user.avatar,
      image: user.image,
      bio: user.bio,
      username: user.username,
      isChef: user.isChef,
      chefProfile: user.chefProfile,
      createdAt: user.createdAt,
    };
  },
});

// Get chef's subscription pricing (for Paywall)
export const getChefPricing = query({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.chefId);
    if (!user) return null;
    return {
      monthlyPrice: user.monthlyPrice ?? 9.99,
      annualPrice: user.annualPrice ?? 69.99,
      hasStripeProducts:
        !!user.stripePriceIdMonthly && !!user.stripePriceIdAnnual,
    };
  },
});

// Promote current user to chef with a profile
export const becomeChef = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    specialties: v.array(v.string()),
    countries: v.optional(v.array(v.string())),
    dietaryTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.isChef) throw new Error("Already a chef");

    const patch: Record<string, unknown> = {
      isChef: true,
      chefProfile: {
        bio: args.bio,
        specialties: args.specialties,
        countries: args.countries ?? [],
        dietaryTags: args.dietaryTags ?? [],
        verified: false,
      },
    };
    if (args.name !== undefined && args.name.trim() !== "") {
      patch.name = args.name.trim();
    }
    await ctx.db.patch(userId, patch);
  },
});

// Create or update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isChef: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existingUser = await ctx.db.get(userId);
    if (existingUser) {
      const patch: Record<string, unknown> = {};
      if (args.name !== undefined) patch.name = args.name;
      if (args.avatar !== undefined) patch.avatar = args.avatar;
      if (args.isChef !== undefined) patch.isChef = args.isChef;
      await ctx.db.patch(userId, patch);
    }
  },
});

// Mark onboarding (role selection + tips) as completed
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { hasCompletedOnboarding: true });
  },
});

// Set hasCompletedOnboarding to false (call after sign-up so new users go through role selection + onboarding)
export const setOnboardingPending = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { hasCompletedOnboarding: false });
  },
});

// Update settings (profile fields + preferences)
export const updateSettings = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultServingSize: v.optional(v.number()),
      measurementUnits: v.optional(v.string()),
      dietaryPreferences: v.optional(v.array(v.string())),
      cuisineInterests: v.optional(v.array(v.string())),
      flavorSpicy: v.optional(v.number()),
      flavorSweet: v.optional(v.number()),
      flavorSavory: v.optional(v.number()),
      discoverMode: v.optional(v.string()),
      notificationsEnabled: v.optional(v.boolean()),
      notifyNewRecipes: v.optional(v.boolean()),
      notifyNewFollowers: v.optional(v.boolean()),
      notifyWeeklySuggestions: v.optional(v.boolean()),
      notifyMealReminders: v.optional(v.boolean()),
      notifyPromotions: v.optional(v.boolean()),
      aiPersonalization: v.optional(v.boolean()),
      language: v.optional(v.string()),
      region: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.username !== undefined) patch.username = args.username;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.preferences !== undefined) {
      const merged = { ...(user.preferences ?? {}), ...args.preferences };
      Object.keys(args.preferences).forEach((key) => {
        const val = (args.preferences as Record<string, unknown>)?.[key];
        if (val !== undefined) {
          (merged as Record<string, unknown>)[key] = val;
        }
      });
      patch.preferences = merged;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }
  },
});

// Get suggested chefs (for right sidebar)
export const getSuggestedChefs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const chefs = await ctx.db
      .query("users")
      .withIndex("by_chef", (q) => q.eq("isChef", true))
      .take(20);

    const filtered = chefs
      .filter((c) => (userId ? c._id !== userId : true))
      .slice(0, 5);

    return filtered.map((c) => ({
      _id: c._id,
      name: c.name ?? "Chef",
      avatar: c.avatar ?? c.image,
      username: c.username,
      countries: c.chefProfile?.countries ?? [],
      dietaryTags: c.chefProfile?.dietaryTags ?? [],
    }));
  },
});

// Delete current user account
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.delete(userId);
  },
});

// Update chef profile (bio, specialties) — only for the current user when they are a chef
export const updateChefProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.isChef || !user.chefProfile)
      throw new Error("User is not a chef or has no chef profile");

    const patch: { chefProfile: { bio?: string; specialties: string[]; verified: boolean } } = {
      chefProfile: {
        ...user.chefProfile,
        specialties: args.specialties ?? user.chefProfile.specialties,
        verified: user.chefProfile.verified,
      },
    };
    if (args.bio !== undefined) patch.chefProfile.bio = args.bio;
    await ctx.db.patch(userId, patch);
  },
});
