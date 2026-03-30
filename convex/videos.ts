import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Creates a video metadata record in the videos table.
 * All mutations and queries run in the Convex runtime.
 */
export const createVideoEntry = mutation({
  args: {
    recipeId: v.id("recipes"),
    chefId: v.id("users"),
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("videos", {
      recipeId: args.recipeId,
      chefId: args.chefId,
      videoId: args.videoId,
      status: "processing",
    });
  },
});

export const updateStatus = mutation({
  args: {
    videoId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .withIndex("by_video_id", (q) => q.eq("videoId", args.videoId))
      .first();

    if (!video) {
      throw new Error(`Video ${args.videoId} not found`);
    }

    await ctx.db.patch(video._id, { status: args.status });
    return video._id;
  },
});

export const attachUploadedVideo = mutation({
  args: {
    recipeId: v.id("recipes"),
    videoId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found");
    if (recipe.chefId !== userId) throw new Error("Not authorised");

    const existingVideo = await ctx.db
      .query("videos")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .first();

    if (existingVideo) {
      await ctx.db.patch(existingVideo._id, {
        videoId: args.videoId,
        status: args.status ?? "processing",
      });
    } else {
      await ctx.db.insert("videos", {
        recipeId: args.recipeId,
        chefId: userId,
        videoId: args.videoId,
        status: args.status ?? "processing",
      });
    }

    await ctx.db.patch(args.recipeId, {
      videoUrl: args.videoId,
    });

    return args.videoId;
  },
});

export const getPlaybackUrl = query({
  args: { videoId: v.string() },
  handler: async (_ctx, args) => {
    return `https://iframe.videodelivery.net/${args.videoId}`;
  },
});

/**
 * Returns the video status for a specific recipe.
 */
export const getVideo = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .first();
  },
});

export const getVideoByRecipeInternal = internalQuery({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .first();
  },
});

export const setVideoStatusInternal = internalMutation({
  args: {
    videoId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .withIndex("by_video_id", (q) => q.eq("videoId", args.videoId))
      .first();

    if (!video) {
      return null;
    }

    if (video.status !== args.status) {
      await ctx.db.patch(video._id, { status: args.status });
    }

    return args.status;
  },
});

export const syncVideoStatus = action({
  args: { recipeId: v.id("recipes") },
  handler: async (
    ctx,
    args,
  ): Promise<{
    videoId: string;
    status: string;
  } | null> => {
    const video = await ctx.runQuery(internal.videos.getVideoByRecipeInternal, {
      recipeId: args.recipeId,
    });

    if (!video) {
      return null;
    }

    return {
      videoId: video.videoId,
      status: video.status,
    };
  },
});
