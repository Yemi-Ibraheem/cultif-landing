import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to check if a user is an admin
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthenticated");

  const user = await ctx.db.get(userId);
  if (!user || user.isAdmin !== true) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// ─── PUBLIC QUERIES ───

// Get all published blogs for the public feed
export const getPublishedBlogs = query({
  args: {},
  handler: async (ctx) => {
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(50); // Pagination could be added later

    // Resolve author and image info
    return Promise.all(
      blogs.map(async (blog) => {
        const author = await ctx.db.get(blog.authorId);
        
        let imageUrl = blog.coverImage;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
            try {
                imageUrl = await ctx.storage.getUrl(imageUrl as any) || undefined;
            } catch (e) {
                console.error("Failed to resolve storage URL", e);
            }
        }

        return {
          ...blog,
          coverImageUrl: imageUrl,
          authorName: author?.name || "Cultif Team",
          authorImage: author?.avatar || author?.image,
        };
      })
    );
  },
});

// Get a single blog by its slug (public reading view)
export const getBlogBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const blog = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!blog) return null;

    const author = await ctx.db.get(blog.authorId);
    
    let imageUrl = blog.coverImage;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
        try {
            imageUrl = await ctx.storage.getUrl(imageUrl as any) || undefined;
        } catch (e) {
            console.error("Failed to resolve storage URL", e);
        }
    }

    return {
      ...blog,
      coverImageUrl: imageUrl,
      authorName: author?.name || "Cultif Team",
      authorImage: author?.avatar || author?.image,
    };
  },
});


// ─── ADMIN CMS MUTATIONS & QUERIES ───

// List all blogs (draft and published) for the CMS dashboard
export const getAllBlogsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const blogs = await ctx.db.query("blogs").order("desc").collect();
    
    return Promise.all(
      blogs.map(async (blog) => {
        let imageUrl = blog.coverImage;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
            try {
                imageUrl = await ctx.storage.getUrl(imageUrl as any) || undefined;
            } catch (e) {
                console.error("Failed to resolve storage URL", e);
            }
        }
        return {
          ...blog,
          coverImageUrl: imageUrl,
        };
      })
    );
  },
});

// Get a single blog for editing
export const getBlogForEditing = query({
  args: { blogId: v.id("blogs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const blog = await ctx.db.get(args.blogId);
    
    if (blog && blog.coverImage && !blog.coverImage.startsWith('http') && !blog.coverImage.startsWith('data:') && !blog.coverImage.startsWith('/')) {
        try {
           const url = await ctx.storage.getUrl(blog.coverImage as any);
           return { ...blog, coverImageUrl: url };
        } catch (e) {
            console.error("Failed to resolve storage URL", e);
        }
    }

    return blog;
  },
});

// Create or Update a blog
export const saveBlog = mutation({
  args: {
    blogId: v.optional(v.id("blogs")),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const now = Date.now();

    // Ensure slug uniqueness
    const existingSlug = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug && existingSlug._id !== args.blogId) {
      throw new Error(`The slug "${args.slug}" is already in use by another post.`);
    }

    const blogData = {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      coverImage: args.coverImage,
      published: args.published,
      updatedAt: now,
    };

    if (args.blogId) {
      // Update
      const existing = await ctx.db.get(args.blogId);
      if (!existing) throw new Error("Blog not found");

      let publishedAt = existing.publishedAt;
      if (!existing.published && args.published) {
        publishedAt = now; // marking as published now
      } else if (existing.published && !args.published) {
        publishedAt = undefined; // unpublishing
      }

      await ctx.db.patch(args.blogId, {
        ...blogData,
        publishedAt,
      });

      return args.blogId;
    } else {
      // Create
      const newBlogId = await ctx.db.insert("blogs", {
        ...blogData,
        authorId: user._id,
        publishedAt: args.published ? now : undefined,
        createdAt: now,
      });

      return newBlogId;
    }
  },
});

export const deleteBlog = mutation({
  args: { blogId: v.id("blogs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const existing = await ctx.db.get(args.blogId);
    if (!existing) throw new Error("Blog not found");

    // Optional: Delete cover image from storage if it exists
    if (existing.coverImage && !existing.coverImage.startsWith('http') && !existing.coverImage.startsWith('/')) {
        try {
            await ctx.storage.delete(existing.coverImage as any);
        } catch (e) {}
    }

    await ctx.db.delete(args.blogId);
  },
});

// Generate upload URL for blog images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
