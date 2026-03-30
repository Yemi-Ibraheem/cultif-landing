import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all plans for the current user
export const getUserPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Populate recipe details for each meal slot
    const populatedPlans = await Promise.all(
      plans.map(async (plan) => {
        const mealsWithRecipes = await Promise.all(
          plan.meals.map(async (meal) => {
            if (!meal.recipeId) return { ...meal, recipe: null };
            const recipe = await ctx.db.get(meal.recipeId);
            return { ...meal, recipe };
          })
        );
        return { ...plan, meals: mealsWithRecipes };
      })
    );

    return populatedPlans;
  },
});

// Get a single plan for a specific date
export const getPlanForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const plan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();

    if (!plan) return null;

    const mealsWithRecipes = await Promise.all(
      plan.meals.map(async (meal) => {
        if (!meal.recipeId) return { ...meal, recipe: null };
        const recipe = await ctx.db.get(meal.recipeId);
        return { ...meal, recipe };
      })
    );

    return { ...plan, meals: mealsWithRecipes };
  },
});

// Get public plans from other users (Explore tab)
export const getExplorePlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(50);

    // Filter out own plans and populate with creator info + recipes
    const populatedPlans = await Promise.all(
      plans
        .filter((plan) => plan.userId !== userId)
        .map(async (plan) => {
          const creator = await ctx.db.get(plan.userId);
          const mealsWithRecipes = await Promise.all(
            plan.meals.map(async (meal) => {
              if (!meal.recipeId) return { ...meal, recipe: null };
              const recipe = await ctx.db.get(meal.recipeId);
              return { ...meal, recipe };
            })
          );
          return {
            ...plan,
            meals: mealsWithRecipes,
            creator: creator
              ? { name: creator.name, avatar: creator.avatar || creator.image }
              : null,
          };
        })
    );

    return populatedPlans;
  },
});

// Create a meal plan
export const createMealPlan = mutation({
  args: {
    name: v.string(),
    dietaryGoal: v.optional(v.string()),
    mealsPerDay: v.optional(v.number()),
    creationMethod: v.optional(v.string()),
    meals: v.array(
      v.object({
        type: v.string(),
        recipeId: v.optional(v.id("recipes")),
      })
    ),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    return await ctx.db.insert("mealPlans", {
      userId,
      name: args.name,
      dietaryGoal: args.dietaryGoal,
      mealsPerDay: args.mealsPerDay,
      creationMethod: args.creationMethod,
      isPublic: false,
      meals: args.meals,
      date: args.date,
      createdAt: Date.now(),
    });
  },
});

// Assign a recipe to a specific meal slot
export const assignRecipeToSlot = mutation({
  args: {
    planId: v.id("mealPlans"),
    mealType: v.string(),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== userId) throw new Error("Plan not found");

    const updatedMeals = plan.meals.map((meal) =>
      meal.type === args.mealType
        ? { ...meal, recipeId: args.recipeId }
        : meal
    );

    await ctx.db.patch(args.planId, { meals: updatedMeals });
  },
});

// Delete a meal plan
export const deleteMealPlan = mutation({
  args: { planId: v.id("mealPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== userId) throw new Error("Plan not found");

    await ctx.db.delete(args.planId);
  },
});

// Toggle plan public visibility
export const togglePlanPublic = mutation({
  args: { planId: v.id("mealPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== userId) throw new Error("Plan not found");

    await ctx.db.patch(args.planId, { isPublic: !plan.isPublic });
  },
});
