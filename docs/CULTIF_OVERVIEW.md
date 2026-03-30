# Cultif Overview — Source of Truth

> **This document is the main source of truth for the direction and vision of Cultif.**

---

## Project Name

**Cultif**

## Goal

Build a modern mobile-first web app (PWA-ready) that helps users discover global food culture through recipes and creators, aligned with their dietary goals.

## Core Concept

Cultif is a **food discovery platform** where users explore recipes from cultures around the world, watch creator-made recipe videos, and follow meal plans based on personal goals (e.g. bulking, keto, slimming, athletic). The app blends **culture, creators, and nutrition**.

---

## Target Users

| Segment | Description |
|---|---|
| **Food lovers** | Want to explore global cuisine |
| **Mothers / homemakers** | Want to create great meals for their families |
| **Health-focused users** | Have specific dietary goals |
| **Food creators / chefs** | Want to monetize content |

---

## Core Features (MVP)

### 1. Authentication

- Email + password signup/login
- User roles: **User** and **Creator**

### 2. Onboarding

- Select dietary goals (bulking, keto, slimming, athletic, maintenance)
- Select food interests (by culture, not just cuisine)
- Optional allergies/preferences

### 3. Home / Discover

- Scrollable feed of recipe cards
- Each card shows:
  - Dish name
  - Culture/region
  - Creator
  - Dietary tags
  - Thumbnail image or video
- "**Discover**" wording instead of "Search" (avoid boxed-in feeling)

### 4. Recipe Detail Page

- Video (if available)
- Ingredients
- Step-by-step instructions
- Nutritional info (placeholder values acceptable)
- Like, save, comment

### 5. Creators

- Creator profile page
- List of uploaded recipes/videos
- Follower count
- Locked content indicator (for future subscriptions)

### 6. Meal Planning (Basic)

- Users can save recipes to a weekly plan
- Simple drag-and-drop or add-to-day interaction

---

## Design Direction

| Principle | Detail |
|---|---|
| **Style** | Clean, premium, modern |
| **Focus** | Culture and storytelling |
| **Palette** | Warm, food-inspired colors |
| **Layout** | Card-based |
| **UI** | Minimal clutter |
| **Responsive** | Mobile-first |
| **Interactions** | Subtle animations |

---

## Tech Expectations

| Layer | Technology |
|---|---|
| **Frontend** | React-based (Vite) |
| **Backend** | Convex |
| **Database** | Users, recipes, creators, likes, saves |

### Future-Ready Architecture

Code is structured cleanly to support upcoming features:

- Subscriptions
- Revenue sharing
- AI-based discovery
- Push notifications

> [!NOTE]
> Use mock data where needed during MVP development.

---

## Constraints

- Prioritize **clarity over complexity**
- **MVP first** — no payment processing yet
- Use placeholders for AI and nutrition APIs
- Code should be **readable, scalable, and production-ready**

---

## Outcome

Deliver a working MVP that:

- ✅ Allows users to discover global recipes
- ✅ Highlights culture-first food exploration
- ✅ Supports creators
- ✅ Feels like the foundation of a **premium food platform**

---

## Discovery Feed — Backend Integration Plan

### Current State (Frontend Mock)
The Discover page renders a `MOCK_FEED` array of hardcoded recipe objects in `src/pages/Discover.tsx`. Each card uses the `FeaturedRecipeCard` component which is now fully dynamic (title, image, country, flag all driven by props).

### Future: Live Feed from Convex
The mock feed will be replaced with a paginated Convex query that pulls recipes from chefs/creators. Each card in the feed represents a recipe uploaded by a creator.

**Planned Convex query:**
```ts
// convex/recipes.ts
export const getDiscoveryFeed = query({
  args: { cursor: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { cursor, limit = 10 }) => {
    // Paginated feed, ordered by newest or relevance
    // Populated with chef info, country, dietary tags, rating
  }
});
```

**Feed behaviour:**
- Cards scroll infinitely (load more on scroll)
- Each card is a different recipe from a different chef/creator
- Title, image, country flag, and rating come from the recipe record
- Dietary icons on the card footer will reflect the recipe's actual tags (not hardcoded)
- Tapping a card navigates to the Recipe Detail page

**Components to build when wiring the backend:**
1. Replace `MOCK_FEED` in `Discover.tsx` with `useQuery(api.recipes.getDiscoveryFeed)`
2. Add infinite scroll / "load more" trigger at bottom of feed
3. Wire dietary icons in `FeaturedRecipeCard` footer to `recipe.tags` dynamically
4. Build `RecipeDetail` page and connect `handleCardClick` navigation
