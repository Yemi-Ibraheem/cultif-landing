# Cultif — Site Map

> **Living document.** This maps every screen in Cultif, its status, and how screens connect. Updated as we build.

---

## Navigation Structure

Bottom tab bar with **4 main sections**:

| Tab | Icon label | Route | Status |
|-----|-----------|-------|--------|
| Home | Home | `/discover` | Built |
| Explore | Explore | `/explore` | Not built |
| Plan | Plan | `/plan` | Not built |
| You | You | `/profile` | Not built |

---

## 1. Pre-Auth Flow

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| Onboarding | `/onboarding` | Built | 3-step carousel introducing the app |
| Auth | `/auth` | Built | Sign up / Sign in with email + password |

---

## 2. Home / Discover (Tab 1)

> The main feed. Culture-first recipe discovery.

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Discover Feed** | `/discover` | Built | Diet filter chips, category scroller, featured recipe cards, country carousel |
| Category Detail | `/category/:id` | Not built | Recipes filtered by category (Breakfast, Dinner, Dessert, etc.) |
| Country Detail | `/country/:code` | Not built | Recipes from a specific country/culture |

**Navigation flows:**
- Tap recipe card → Recipe Detail
- Tap category → Category Detail
- Tap country card → Country Detail
- Tap "View all" → Filtered list

---

## 3. Explore (Tab 2)

> Search and browse beyond the feed.

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Explore Home** | `/explore` | Not built | Search bar, browse by culture, browse by category, trending |
| Search Results | `/explore/search` | Not built | Filtered results from search input |

**Navigation flows:**
- Type in search → Search Results
- Tap culture/country tile → Country Detail (shared)
- Tap recipe → Recipe Detail (shared)
- Tap creator → Creator Profile (shared)

---

## 4. Plan (Tab 3)

> Meal planning — explore community plans or create your own.
>
> **Figma ref:** `src/UserFlows/Explore plans 1.png`, `Explore plans 2.png`, `Your plans .png`

### Plans Home

Two tabs at the top: **"Explore plans"** and **"Your plans"**

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Plans Home (Explore)** | `/plan` | Not built | Date header with day-of-week selector (MON–SAT). Meal sections (Breakfast, Lunch, Snack, Dinner) with recipe images. "Create plan" and "Explore plans" buttons per section |
| **Plans Home (Your Plans)** | `/plan?tab=yours` | Not built | Shows saved plan types as icons (Bulk plan, Cut plan, Enjoyment, etc.) + "Create another plan" button |

### Your Plans Detail

> **Figma ref:** `src/UserFlows/Your plans .png`

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Plan Detail** | `/plan/:id` | Not built | Goal header (e.g. "Burn fat and keep muscle"), daily meal breakdown (Breakfast, Lunch, Snack, Dinner) with recipe images and names. Daily nutritional summary (Protein, Carbs, Calories). "All saved plans" button at bottom |
| **All Saved Plans** | `/plan/saved` | Not built | List of all user's saved/created plans |

**Navigation flow:**
```
Your Plans tab → Tap plan icon (Bulk, Cut, etc.) → Plan Detail
  Plan Detail → Tap recipe → Recipe Detail (shared)
  Plan Detail → "All saved plans" → All Saved Plans
```

### Create Plan Flow

| Step | Screen | Route | Status | Description |
|------|--------|-------|--------|-------------|
| 1 | **Choose Method** | `/plan/create` | Not built | Two options: "Use AI to create your custom plan" or "+ Create your plan" (manual) |
| 2 | **Dietary Goal** | `/plan/create/dietary` | Not built | Radio select: Build muscle, Gain weight, Lose weight, Eat healthy, Cheat day, Custom |
| 3 | **Meals Per Day** | `/plan/create/amount` | Not built | Radio select: 1–7 meals, or "?" |
| 4 | **Get Started** | `/plan/create/meals` | Not built | Assign recipes to each meal slot: Choose breakfast, Choose lunch, Choose dinner, Choose snack. Each slot is tappable |

### Meal Selection (when tapping a meal slot)

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Browse Recipes** | `/plan/create/meals/browse` | Not built | Grid of recipe images to pick from, FAB (+) button |
| **Filter Recipes** | `/plan/create/meals/filter` | Not built | Filter by time of day, by country, search. Narrows down the recipe grid |

### Navigation Flow
```
Plan tab → Plans Home (Explore / Your Plans tabs)
  Plans Home → "Create plan" → Choose Method
    → AI path (future) or Manual path:
      Manual → Dietary Goal → Meals Per Day → Get Started
        Get Started → Tap meal slot → Browse Recipes → Filter Recipes → Select recipe → back to Get Started
        Get Started (all filled) → Next → Plan saved
  Plans Home → Tap recipe in plan → Recipe Detail (from Follow Recipe flow)
```

Each step has **Next** and **Skip for now** options. Back arrow returns to previous step.

---

## 5. You / Profile (Tab 4)

> User profile and settings. Hub for all account activity.
>
> **Figma ref:** `src/UserFlows/Share.png` (middle screen), `src/UserFlows/Profile 1.png`

### Profile Home
The main profile screen shows the chef/user avatar, display name, handle, and a **"Share to the world"** CTA button. Below that is a menu list:

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Profile Home** | `/profile` | Not built | Avatar, name, handle, "Share to the world" button, 3 saved tabs (see below), menu list |

### Saved Content Tabs (on Profile Home)

Three tabs on the profile screen showing the user's saved/bookmarked content:

| Tab | Route | Status | Description |
|-----|-------|--------|-------------|
| **Saved Dishes** | `/profile?tab=dishes` | Not built | Grid of dishes the user has saved/bookmarked from the feed or recipe detail |
| **Saved Countries** | `/profile?tab=countries` | Not built | Countries the user has saved — quick access to recipes from their favourite cultures |
| **Saved Creators** | `/profile?tab=creators` | Not built | Creators the user has saved — tap to go to that creator's profile |

**How content gets saved:**
- **Dishes:** User saves a dish from Recipe Detail or the Discover feed
- **Countries:** User saves a country from the Country Detail or country carousel
- **Creators:** User saves a creator from their Chef Profile page

### Profile Menu

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| Your Dishes | `/profile/dishes` | Not built | Chef's uploaded recipes (creator view of their own content) |
| Your Saved Plans | `/profile/saved-plans` | Not built | User's saved meal plans |
| Your Custom Ingredients | `/profile/custom-ingredients` | Not built | Ingredients the chef has created via the Create flow |
| Sales/Net Activity | `/profile/sales` | Not built | Revenue and activity dashboard (creator-only) |
| Purchases and Memberships | `/profile/purchases` | Not built | User's subscription/purchase history |
| Switch Account | — | Not built | Switch between user/creator accounts (modal or flow) |
| Settings | `/profile/settings` | Not built | App settings |
| Help and Feedback | `/profile/help` | Not built | Support and feedback |
| Log out | — | Not built | Signs user out, returns to Auth |

### Share Your Page Flow (Creator)

> **Figma ref:** `src/UserFlows/Share.png` (right screen)

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Share Your Page** | `/profile/share` | Not built | Copyable profile link + social share icons (Copy link, Instagram, TikTok, etc.). Helps creators promote their page and "start getting paid for your talent" |

**Navigation flow:**
```
Profile Home → "Share to the world" button → Share Your Page
Share Your Page → Copy link / tap social icon → opens external share
Back arrow → Profile Home
```

---

## 6. Create Recipe Flow (Creator Only)

> 7-step wizard triggered by the FAB (+) button. Chef uploads a dish to the platform.
>
> **Figma ref:** `src/UserFlows/Create 1.png` → `Create 2.png` → `Create 3.png` (branch: `Create 1.5.png`)

### Entry Point
- Chef taps **FloatingActionButton (+)** from any tab → opens Create wizard

### Wizard Steps

| Step | Screen | Route | Status | Description |
|------|--------|-------|--------|-------------|
| 1 | **Dish Basics** | `/create/basics` | Not built | Upload cover image, dish name, description |
| 2 | **Ingredients** | `/create/ingredients` | Not built | Add ingredients with quantities and icons |
| 3 | **Country** | `/create/country` | Not built | Select dish origin country/culture |
| 4 | **Time** | `/create/time` | Not built | Prep time + cook time scroll pickers (HH:MM:SS) |
| 5 | **Goal** | `/create/goal` | Not built | Weight goal radio select: Build muscle, Gain weight, Lose weight, Eat healthy, Cheat day |
| 6 | **Day** | `/create/day` | Not built | Time of day radio select: Breakfast, Lunch, Dinner, Snack |
| 7 | **Dietary** | `/create/dietary` | Not built | Multi-select dietary tags: Halal, Vegan, Vegetarian, Kosher. Also: Upload video button, Schedule send link |

### Post-Wizard Screens

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Rules of Upload** | `/create/rules` | Not built | Rules checklist (no alcohol, accurate info). Checkbox to agree activates Upload button |
| **Uploading** | `/create/uploading` | Not built | Progress circle with percentage, tip text |
| **Upload Failed** | `/create/uploading` | Not built | Error state with Retry button + "Go back to steps" |
| **Upload Complete** | `/create/complete` | Not built | Congratulations screen with "Upload another dish" / "View dish" |

### Branch Screens (off main flow)

| Branch From | Screen | Route | Status | Description |
|-------------|--------|-------|--------|-------------|
| Step 7 (Dietary) | **Schedule Send** | `/create/schedule` | Not built | Calendar date picker + time picker (HH:MM AM/PM), "Skip for now" option |
| Step 2 (Ingredients) | **Custom Ingredient** | `/create/ingredients/custom` | Not built | Name, upload photo, nutritional fields (Protein, Carbs, Fat, Sodium, Sugars, Energy) with unit dropdowns. Reviewed once live |

### Navigation Flow
```
FAB (+) → Step 1 (Basics) → Step 2 (Ingredients) → Step 3 (Country) → Step 4 (Time)
  → Step 5 (Goal) → Step 6 (Day) → Step 7 (Dietary) → Rules → Uploading → Complete → View Dish

Branch from Step 2: → Custom Ingredient → back to Step 2
Branch from Step 7: → Schedule Send → back to Step 7
```

Each step has **Next** and **Skip for now** options. Back arrow returns to previous step.

### What Happens After Upload
Once the chef completes the wizard and the upload succeeds:
1. The recipe data (image, ingredients, country, tags, video, nutrition, etc.) is sent to **Convex backend**
2. A new recipe record is created in the `recipes` table, linked to the chef's user ID
3. The recipe becomes **discoverable** — it appears in the Discover feed, country/category filters, and search results
4. The recipe is listed on the **Chef's profile page** under their uploaded recipes
5. If the chef chose **Schedule Send**, the recipe is stored but not published until the scheduled date/time

---

## 7. Follow Recipe Flow (User)

> User discovers a dish, views it, and follows the step-by-step cooking guide.
>
> **Figma ref:** `src/UserFlows/Follow recipe.png`

### Main Flow

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Recipe Detail** | `/recipe/:id` | Not built | Dish hero image, chef name/avatar, "Start cooking" CTA, prep time, portions, nutrition summary, ingredients preview |
| **Recipe Step** | `/recipe/:id/step/:step` | Not built | Video/image of current step with play overlay, step instructions below. Navigates through steps sequentially |
| **Recipe Complete** | `/recipe/:id/complete` | Not built | Congratulations/completion screen after finishing all steps. Option to rate/review the dish |

### Branch Screens (accessible from Recipe Detail)

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **View Ingredients** | `/recipe/:id/ingredients` | Not built | Full ingredients list with quantities and icons (modal/sheet on blue background) |
| **View Nutrition** | `/recipe/:id/nutrition` | Not built | Full nutritional breakdown with macros (modal/sheet on blue background) |

### Paywall / Subscription Gate
- The **"Start cooking"** button is the paywall trigger
- **Non-subscribers:** Ingredients are **blurred**, cooking steps are locked. Prompted to subscribe to the chef to unlock
- **Subscribers:** Full access to all steps, ingredients, and nutrition
- This ties into the future subscription/revenue-sharing system from the overview doc

### Navigation Flow
```
Discover Feed → Tap card → Recipe Detail
  Recipe Detail → "Start cooking" → [Paywall check] → Recipe Step 1 → Step 2 → ... → Recipe Complete
  Recipe Detail → "View ingredients" → View Ingredients (sheet) → back
  Recipe Detail → "View nutrition" → View Nutrition (sheet) → back
  Recipe Complete → back to Discover / rate dish
```

---

## 8. Discover Chef Flow (User)

> User finds a chef via a recipe card and views their profile, dishes, and optionally subscribes.
>
> **Figma ref:** `src/UserFlows/DiscoverChef.png`

### Main Flow

| Screen | Route | Status | Description |
|--------|-------|--------|-------------|
| **Chef Profile** | `/creator/:id` | Not built | Chef avatar, name, handle, bio, follower/subscriber count, "Subscribe" CTA, preview of their dishes |
| **Chef's Dishes** | `/creator/:id/dishes` | Not built | Scrollable list/grid of all the chef's uploaded recipes with thumbnails |
| **Subscribe (Holding Page)** | `/creator/:id/subscribe` | Not built | Placeholder CTA page for future subscription/payment integration. For MVP this is just a holding page |

### Navigation Flow
```
Discover Feed → Tap chef name/avatar on recipe card → Chef Profile
  Chef Profile → Browse dishes → Chef's Dishes → Tap recipe → Recipe Detail (from Follow Recipe flow)
  Chef Profile → "Subscribe" CTA → Subscribe Holding Page
  Back arrow → previous screen
```

### Connection to Paywall
- Subscribing to a chef unlocks their **blurred ingredients** and **cooking steps** (see Section 7 — Follow Recipe Flow)
- Until subscriptions are built, the holding page serves as a placeholder

---

## 9. Other Shared Screens

> Screens accessible from multiple flows that don't belong to a specific section above.

---

## Screen Count Summary

| Category | Total | Built | Remaining |
|----------|-------|-------|-----------|
| Pre-Auth | 2 | 2 | 0 |
| Home / Discover | 3 | 1 | 2 |
| Explore | 2 | 0 | 2 |
| Plan (Explore + Your Plans + Create) | 10 | 0 | 10 |
| Profile / You | 12 | 0 | 12 |
| Share Flow | 1 | 0 | 1 |
| Create Recipe Flow | 13 | 0 | 13 |
| Follow Recipe Flow | 5 | 0 | 5 |
| Discover Chef Flow | 3 | 0 | 3 |
| **Total** | **51** | **3** | **48** |

---

## MVP Scope

Everything documented above represents the **MVP**. These are the flows we will build first:

1. **Create Recipe** — Chef uploads a dish (7-step wizard)
2. **Share Profile** — Chef shares their page link to social channels
3. **Follow Recipe** — User views a dish and follows cooking steps (with paywall gate)
4. **Discover Chef** — User finds a chef, views their profile, subscribes (holding page)
5. **Explore Plans** — Browse community plans or create your own
6. **Your Plans** — View and manage saved meal plans
7. **Profile** — Saved dishes, saved countries, saved creators + menu items

Post-MVP features (to be mapped later): Explore tab search, notifications, comments/reviews, AI meal plan generation, payment integration, and more.

---

## Notes

- Routes are proposed — final paths may change during implementation.
- Backend queries/mutations already exist for recipes, users, saved recipes, and meal plans in Convex.
- Figma user flow screenshots stored in `src/UserFlows/` for reference.
