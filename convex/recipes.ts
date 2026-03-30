import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const recipeVideoSectionValidator = v.object({
  title: v.string(),
  description: v.optional(v.string()),
  startTime: v.number(),
  endTime: v.optional(v.number()),
});

const recipeVideoValidator = v.object({
  storageId: v.id("_storage"),
  duration: v.optional(v.number()),
  sections: v.array(recipeVideoSectionValidator),
});

// Get all recipes (for discover page) — requires auth, paginated
export const getAllRecipes = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("recipes")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef
            ? { id: chef._id, name: chef.name || "Unknown Chef", avatar: chef.avatar }
            : null,
        };
      })
    );

    return { ...result, page };
  },
});

// Get recipes by country
export const getRecipesByCountry = query({
  args: { country: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_country", (q) => q.eq("country", args.country))
      .order("desc")
      .take(30);
    
    return Promise.all(
      recipes.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef ? {
            id: chef._id,
            name: chef.name || "Unknown Chef",
            avatar: chef.avatar,
          } : null,
        };
      })
    );
  },
});

// Get recipes with optional filters (country, category, dietary tags, max duration)
export const getFilteredRecipes = query({
  args: {
    country: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    maxDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    let recipes;
    if (args.country) {
      const country = args.country;
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_country", (q) => q.eq("country", country))
        .order("desc")
        .take(30);
    } else {
      recipes = await ctx.db.query("recipes").order("desc").take(30);
    }

    let filtered = recipes;
    if (args.category) {
      filtered = filtered.filter((r) => r.category === args.category);
    }
    if (args.tags && args.tags.length > 0) {
      filtered = filtered.filter((r) =>
        args.tags!.every((tag) => r.tags.includes(tag))
      );
    }
    if (args.maxDuration != null) {
      filtered = filtered.filter((r) => {
        const total = (r.prepTime ?? 0) + (r.cookTime ?? 0);
        return total <= args.maxDuration!;
      });
    }

    return Promise.all(
      filtered.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef ? {
            id: chef._id,
            name: chef.name || "Unknown Chef",
            avatar: chef.avatar,
          } : null,
        };
      })
    );
  },
});

// Get recent recipes for the current time of day (for top banner)
// Before 11am -> Breakfast, 11am-2pm -> Lunch, 2pm-5pm -> Snack, 5pm+ -> Dinner
export const getTimeOfDayRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const hour = new Date().getHours();
    const category =
      hour < 11 ? "Breakfast" : hour < 14 ? "Lunch" : hour < 17 ? "Snack" : "Dinner";
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_category", (q) => q.eq("category", category))
      .order("desc")
      .take(6);
    return Promise.all(
      recipes.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef
            ? {
                id: chef._id,
                name: chef.name || "Unknown Chef",
                avatar: chef.avatar,
              }
            : null,
        };
      })
    );
  },
});

// Get recipes by category
export const getRecipesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .take(30);
    
    return Promise.all(
      recipes.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef ? {
            id: chef._id,
            name: chef.name || "Unknown Chef",
            avatar: chef.avatar,
          } : null,
        };
      })
    );
  },
});

// Get recipes by tags (diet filters)
export const getRecipesByTags = query({
  args: { tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const allRecipes = await ctx.db.query("recipes").order("desc").take(50);
    
    const filtered = allRecipes.filter((recipe) =>
      args.tags.some((tag) => recipe.tags.includes(tag))
    );
    
    return Promise.all(
      filtered.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef ? {
            id: chef._id,
            name: chef.name || "Unknown Chef",
            avatar: chef.avatar,
          } : null,
        };
      })
    );
  },
});

// Get featured recipes (highest rated)
export const getFeaturedRecipes = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const limit = args.limit || 10;
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_rating")
      .order("desc")
      .take(limit);
    
    return Promise.all(
      recipes.map(async (recipe) => {
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef ? {
            id: chef._id,
            name: chef.name || "Unknown Chef",
            avatar: chef.avatar,
          } : null,
        };
      })
    );
  },
});

// Get recipe by ID
export const getRecipeById = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) return null;
    
    const chef = await ctx.db.get(recipe.chefId);
    return {
      ...recipe,
      chef: chef ? {
        id: chef._id,
        name: chef.name || "Unknown Chef",
        avatar: chef.avatar,
      } : null,
    };
  },
});

// Save/unsave a recipe
export const toggleSaveRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already saved
    const existing = await ctx.db
      .query("savedRecipes")
      .withIndex("by_user_and_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId)
      )
      .first();
    
    if (existing) {
      // Unsave
      await ctx.db.delete(existing._id);
      // Remove from recipe's savedBy array
      const recipe = await ctx.db.get(args.recipeId);
      if (recipe) {
        await ctx.db.patch(args.recipeId, {
          savedBy: recipe.savedBy.filter((id) => id !== args.userId),
        });
      }
    } else {
      // Save
      await ctx.db.insert("savedRecipes", {
        userId: args.userId,
        recipeId: args.recipeId,
        savedAt: Date.now(),
      });
      // Add to recipe's savedBy array
      const recipe = await ctx.db.get(args.recipeId);
      if (recipe) {
        await ctx.db.patch(args.recipeId, {
          savedBy: [...recipe.savedBy, args.userId],
        });
      }
    }
  },
});

// Check if recipe is saved by user
export const isRecipeSaved = query({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedRecipes")
      .withIndex("by_user_and_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId)
      )
      .first();
    
    return saved !== null;
  },
});

// Get recipes by a specific chef
export const getRecipesByChef = query({
  args: { chefId: v.id("users") },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_chef", (q) => q.eq("chefId", args.chefId))
      .order("desc")
      .take(50);

    const chef = await ctx.db.get(args.chefId);
    return recipes.map((recipe) => ({
      ...recipe,
      chef: chef ? {
        id: chef._id,
        name: chef.name || "Unknown Chef",
        avatar: chef.avatar,
      } : null,
    }));
  },
});

// Get recipes by the current user (their own dishes)
export const getMyRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_chef", (q) => q.eq("chefId", userId))
      .order("desc")
      .take(50);

    return recipes.map((recipe) => ({
      ...recipe,
      chef: { id: userId, name: "", avatar: undefined },
    }));
  },
});

// Get user's saved recipes
export const getMySavedRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const saved = await ctx.db
      .query("savedRecipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    const recipes = await Promise.all(
      saved.map(async (s) => {
        const recipe = await ctx.db.get(s.recipeId);
        if (!recipe) return null;
        const chef = await ctx.db.get(recipe.chefId);
        return {
          ...recipe,
          chef: chef
            ? { id: chef._id, name: chef.name || "Unknown Chef", avatar: chef.avatar }
            : null,
        };
      })
    );

    return recipes.filter(Boolean);
  },
});

// Create a new recipe (for chefs)
export const createRecipe = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    country: v.string(),
    countryFlag: v.string(),
    tags: v.array(v.string()),
    category: v.string(),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
    })),
    instructions: v.array(v.string()),
    weightGoal: v.optional(v.string()),
    recipeVideo: v.optional(recipeVideoValidator),
    videoUrl: v.optional(v.string()),
    videoParts: v.optional(v.array(v.object({
      name: v.string(),
      notes: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      ingredients: v.array(v.string()),
    }))),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.isChef) {
      throw new Error("Only chefs can create recipes");
    }

    const status = args.scheduledAt ? "scheduled" : "published";

    return await ctx.db.insert("recipes", {
      ...args,
      chefId: userId,
      rating: 0,
      savedBy: [],
      createdAt: Date.now(),
      status,
    });
  },
});

// Update an existing recipe (owner only)
export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    country: v.optional(v.string()),
    countryFlag: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    ingredients: v.optional(v.array(v.object({
      name: v.string(),
      amount: v.string(),
    }))),
    instructions: v.optional(v.array(v.string())),
    weightGoal: v.optional(v.string()),
    recipeVideo: v.optional(recipeVideoValidator),
    videoUrl: v.optional(v.string()),
    videoParts: v.optional(v.array(v.object({
      name: v.string(),
      notes: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      ingredients: v.array(v.string()),
    }))),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found");
    if (recipe.chefId !== userId) throw new Error("Not authorised");

    const { recipeId, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (patch.scheduledAt !== undefined) {
      patch.status = patch.scheduledAt ? "scheduled" : "published";
    }

    await ctx.db.patch(recipeId, patch);
  },
});

// Delete a recipe (owner only)
export const deleteRecipe = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found");
    if (recipe.chefId !== userId) throw new Error("Not authorised");

    await ctx.db.delete(args.recipeId);
  },
});

// Generate upload URL for Convex file storage (images/videos)
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a stored file URL by storage ID
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
