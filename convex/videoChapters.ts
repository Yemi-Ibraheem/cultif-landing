import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createVideoChapter = mutation({
  args: {
    recipeId: v.id("recipes"),
    videoId: v.string(),
    title: v.string(),
    description: v.string(),
    startTime: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (recipe.chefId !== userId) {
      throw new Error("Not authorised to edit chapters for this recipe");
    }

    return await ctx.db.insert("videoChapters", args);
  },
});

export const getVideoChaptersByRecipe = query({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query("videoChapters")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();

    return chapters.sort((a, b) => a.order - b.order);
  },
});
