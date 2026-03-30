import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const recipeVideoSection = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  startTime: v.number(),
  endTime: v.optional(v.number()),
});

export default defineSchema({
  ...authTables,
  // Explicit authRateLimits ensures identifier index exists (required by Convex Auth rate limiting).
  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier"]),

  // Users table — extends auth users with custom fields.
  // Must include all fields from authTables.users plus your own.
  users: defineTable({
    // Auth fields (required by Convex Auth)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom Cultif fields
    isAdmin: v.optional(v.boolean()),
    avatar: v.optional(v.string()),
    isChef: v.optional(v.boolean()),
    chefProfile: v.optional(v.object({
      bio: v.optional(v.string()),
      specialties: v.array(v.string()),
      countries: v.optional(v.array(v.string())),
      dietaryTags: v.optional(v.array(v.string())),
      verified: v.boolean(),
    })),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.optional(v.number()),
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
    // Stripe subscription products (chef monetisation)
    stripeProductId: v.optional(v.string()),
    stripePriceIdMonthly: v.optional(v.string()),
    stripePriceIdAnnual: v.optional(v.string()),
    // Legacy Polar fields (kept for existing data compatibility)
    polarProductIdMonthly: v.optional(v.string()),
    polarProductIdAnnual: v.optional(v.string()),
    monthlyPrice: v.optional(v.number()),
    annualPrice: v.optional(v.number()),
    // Post-login onboarding (role selection + tips). undefined = legacy user (skip), false = must complete, true = done
    hasCompletedOnboarding: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_chef", ["isChef"]),

  // Recipes table
  recipes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(), // Convex storage URL or external URL
    country: v.string(),
    countryFlag: v.string(),
    chefId: v.id("users"),
    tags: v.array(v.string()), // e.g., ["Protein", "Halal", "Vegan"]
    category: v.string(), // e.g., "Breakfast", "Dinner", "Desserts"
    rating: v.number(),
    reviewCount: v.optional(v.number()),
    prepTime: v.optional(v.number()), // in seconds
    cookTime: v.optional(v.number()), // in seconds
    servings: v.optional(v.number()),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
    })),
    instructions: v.array(v.string()),
    savedBy: v.array(v.id("users")), // users who saved this recipe
    createdAt: v.number(),
    // New fields for Create flow
    weightGoal: v.optional(v.string()), // "Build muscle", "Gain weight", "Lose weight", "Eat healthy", "Cheat day"
    recipeVideo: v.optional(v.object({
      storageId: v.id("_storage"),
      duration: v.optional(v.number()),
      sections: v.array(recipeVideoSection),
    })),
    videoUrl: v.optional(v.string()), // Convex storage URL for recipe video
    videoParts: v.optional(v.array(v.object({
      name: v.string(),
      notes: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      ingredients: v.array(v.string()),
    }))),
    scheduledAt: v.optional(v.number()), // Timestamp for scheduled publish
    status: v.optional(v.string()), // "published" or "scheduled"
  })
    .index("by_chef", ["chefId"])
    .index("by_country", ["country"])
    .index("by_category", ["category"])
    .index("by_rating", ["rating"]),

  // Saved recipes (user's saved recipes)
  savedRecipes: defineTable({
    userId: v.id("users"),
    recipeId: v.id("recipes"),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_and_recipe", ["userId", "recipeId"]),

  // Subscriptions (user subscribes to a chef; payment via Stripe)
  subscriptions: defineTable({
    userId: v.id("users"),
    chefId: v.id("users"),
    plan: v.optional(v.union(v.literal('monthly'), v.literal('annual'))),
    subscribedAt: v.number(),
    stripeSubscriptionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    status: v.optional(v.string()), // 'active' | 'canceled' | 'revoked'
    currentPeriodEnd: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_chef", ["chefId"])
    .index("by_user_and_chef", ["userId", "chefId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  // Pending Stripe product setup (chef starts setup in app; action completes it)
  stripeProductRequests: defineTable({
    userId: v.id("users"),
    monthlyPrice: v.number(),
    annualPrice: v.number(),
    productName: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"]),

  // Stripe Connect demo: maps an app user to one connected account ID.
  connectAccounts: defineTable({
    userId: v.id("users"),
    stripeAccountId: v.string(),
    displayName: v.string(),
    contactEmail: v.string(),
    country: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_account", ["stripeAccountId"]),

  // Stripe Connect demo: maps each platform product to a destination account.
  connectProducts: defineTable({
    stripeProductId: v.string(),
    stripeDefaultPriceId: v.optional(v.string()),
    connectedAccountId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    unitAmount: v.number(),
    currency: v.string(),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["stripeProductId"])
    .index("by_connected_account", ["connectedAccountId"])
    .index("by_creator", ["createdByUserId"]),

  // Optional thin-event snapshots for local debugging/demo visibility.
  connectWebhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    stripeAccountId: v.optional(v.string()),
    payload: v.string(),
    createdAt: v.number(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_event_type", ["eventType"])
    .index("by_created", ["createdAt"]),

  // Rate limiting for auth (brute-force protection)
  appRateLimits: defineTable({
    key: v.string(),        // e.g. "password:user@example.com" or "otp:user@example.com"
    attempts: v.number(),
    windowStart: v.number(), // timestamp (ms) when the current window began
    lockedUntil: v.optional(v.number()), // timestamp (ms) — if set, reject until then
  })
    .index("by_key", ["key"]),

  // Countries (for filters and recipe creation)
  countries: defineTable({
    name: v.string(),
    code: v.string(), // ISO 3166-1 alpha-2
    flagEmoji: v.string(),
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"]),

  // Meal plans
  mealPlans: defineTable({
    userId: v.id("users"),
    name: v.string(),
    dietaryGoal: v.optional(v.string()),
    mealsPerDay: v.optional(v.number()),
    creationMethod: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    meals: v.array(v.object({
      type: v.string(),
      recipeId: v.optional(v.id("recipes")),
    })),
    date: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_public", ["isPublic"]),

  // Video records
  videos: defineTable({
    recipeId: v.id("recipes"),
    chefId: v.id("users"),
    videoId: v.string(),
    status: v.string(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_chef", ["chefId"])
    .index("by_video_id", ["videoId"]),

  videoChapters: defineTable({
    recipeId: v.id("recipes"),
    videoId: v.string(),
    title: v.string(),
    description: v.string(),
    startTime: v.number(),
    order: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_video_id", ["videoId"]),

  // Legacy table — kept so existing data doesn't block schema pushes.
  // No frontend code writes to this table any more.
  manualVideoSubmissions: defineTable({
    recipeId: v.id("recipes"),
    chefId: v.id("users"),
    notes: v.optional(v.string()),
    status: v.string(),
    attachedVideoId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_chef", ["chefId"]),

  // Blogging & CMS System
  blogs: defineTable({
    title: v.string(),
    slug: v.string(), // e.g. "my-first-blog-post"
    content: v.string(), // Markdown or HTML
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()), // Convex storage ID or URL
    authorId: v.id("users"),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published", "publishedAt"])
    .index("by_author", ["authorId"]),
});
