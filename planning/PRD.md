# Cultif — Product Requirements Document (PRD)

> **Version**: 1.0
> **Last Updated**: February 28, 2026
> **Status**: Living Document

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Vision & Goals](#2-vision--goals)
3. [Target Users](#3-target-users)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Information Architecture](#5-information-architecture)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [Authentication & Onboarding](#61-authentication--onboarding)
   - 6.2 [Discover (Home Feed)](#62-discover-home-feed)
   - 6.3 [Explore](#63-explore)
   - 6.4 [Recipe Detail](#64-recipe-detail)
   - 6.5 [Cooking Mode (Recipe Steps)](#65-cooking-mode-recipe-steps)
   - 6.6 [Recipe Creation Wizard](#66-recipe-creation-wizard)
   - 6.7 [Subscription & Paywall](#67-subscription--paywall)
   - 6.8 [Meal Planning](#68-meal-planning)
   - 6.9 [Chef Profiles](#69-chef-profiles)
   - 6.10 [User Profile & Settings](#610-user-profile--settings)
   - 6.11 [Country Browsing](#611-country-browsing)
   - 6.12 [Legal & Policy Pages](#612-legal--policy-pages)
7. [Data Model](#7-data-model)
8. [Backend API Surface](#8-backend-api-surface)
9. [Tech Stack](#9-tech-stack)
10. [Navigation & Routing](#10-navigation--routing)
11. [Design System Summary](#11-design-system-summary)
12. [Deferred / Hidden Features](#12-deferred--hidden-features)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Open Questions & Future Considerations](#14-open-questions--future-considerations)

---

## 1. Product Overview

**Cultif** is a mobile-first web application (PWA-ready) for recipe discovery, cooking, and meal planning. It blends **culture, creators, and nutrition** — users explore recipes from cuisines around the world, watch creator-made cooking videos, subscribe to chefs, and follow meal plans aligned with personal dietary goals.

The platform operates on a **creator economy model**: chefs upload recipes with step-by-step video instructions, and users subscribe to individual chefs to unlock their full content. Payments are processed through **Polar** (Stripe-compatible).

---

## 2. Vision & Goals

| Dimension | Detail |
|---|---|
| **Mission** | Help users discover global food culture through recipes and creators, aligned with their dietary goals |
| **Core Pillars** | Culture-first food exploration, creator monetization, personalized nutrition |
| **Design Philosophy** | Clean, premium, modern — warm food-inspired colors, card-based layouts, minimal clutter |
| **Platform** | Mobile-first responsive web app (React SPA) |

### Success Metrics (Aspirational)

- User recipe engagement (views, saves, cook-throughs)
- Creator onboarding rate (users → chefs)
- Subscription conversion rate
- Meal plan creation and adherence
- Recipe completion rate (started cooking → finished)

---

## 3. Target Users

| Segment | Description | Primary Needs |
|---|---|---|
| **Food Lovers** | Curious eaters who want to explore global cuisine | Discovery, variety, cultural context |
| **Mothers / Homemakers** | Planning meals for families | Meal planning, reliable recipes, nutritional info |
| **Health-Focused Users** | People with specific dietary goals (bulking, keto, weight loss) | Filtered discovery, goal-tagged recipes, nutrition facts |
| **Food Creators / Chefs** | Content creators who want to monetize recipe videos | Upload tools, subscriber management, revenue |

---

## 4. User Roles & Permissions

### 4.1 Food Lover (Default Role)

- Browse and discover recipes (Discover feed, Explore grid)
- View recipe details (partial — ingredients may be gated)
- Subscribe to chefs to unlock full content
- Save recipes to personal collection
- Create and manage meal plans
- Manage profile, preferences, and settings

### 4.2 Chef (Upgraded Role)

All Food Lover capabilities, plus:

- Upload recipes via the 8-step creation wizard
- Upload cooking videos with timeline-based segment editing
- Set subscription pricing (monthly and annual plans via Polar)
- View subscriber count
- Edit/delete own recipes
- Schedule recipe publishing
- Editable public chef profile (bio, specialties, cuisines, dietary focus)

### 4.3 Role Transition

- New users select a role during onboarding (Chef or Food Lover)
- Food Lovers can upgrade to Chef at any time via the "Become a Chef" modal or Chef Onboarding flow
- Chef status is stored as `isChef: true` on the user record with an associated `chefProfile` object
- The upgrade flow collects: name, bio, specialties, country cuisines, and dietary tags

---

## 5. Information Architecture

### 5.1 App Structure

```
Cultif
├── Auth (Sign In / Sign Up)
├── Role Selection (Chef / Food Lover)
├── Onboarding (3-step tips carousel)
│
├── Main App (Bottom Navigation)
│   ├── Home (Discover) ← default route
│   │   ├── Category Story Viewer
│   │   ├── Filter Modal
│   │   └── Recipe Cards → Recipe Detail
│   │
│   ├── Explore
│   │   └── Grid → Popup Preview → Recipe Detail
│   │
│   ├── Plan
│   │   ├── Your Plans (calendar view)
│   │   ├── Explore Plans
│   │   └── Create Plan (wizard)
│   │       ├── Dietary Goal
│   │       ├── Meals Per Day
│   │       └── Meal Slots Hub → Browse Recipes
│   │
│   └── You (Profile)
│       ├── Profile Menu
│       ├── My Dishes (chef only)
│       ├── Subscribers (placeholder)
│       ├── Settings (comprehensive)
│       ├── Help & FAQ
│       ├── Share Profile
│       ├── Saved Ingredients (placeholder)
│       ├── Purchases (placeholder)
│       └── Rate App
│
├── Recipe Flow
│   ├── Recipe Detail
│   ├── Paywall (if not subscribed)
│   ├── Cooking Steps (step-by-step)
│   └── Recipe Complete (celebration)
│
├── Chef Flow
│   ├── Chef Onboarding (multi-step wizard)
│   ├── Create Recipe (8-step wizard)
│   └── Chef Profile (public)
│
├── Country Browsing
│   └── All Countries → filtered Discover feed
│
└── Legal Pages
    ├── Terms of Service
    ├── Privacy Policy
    ├── Community Guidelines
    ├── Creator Agreement
    ├── Cookie Policy
    ├── DMCA / Copyright Policy
    ├── Acceptable Use Policy
    └── Refund Policy
```

### 5.2 Bottom Navigation Tabs

| Tab | Route | Icon | Description |
|---|---|---|---|
| Home | `/discover` | House icon | Recipe discovery feed |
| Explore | `/explore` | Compass icon | Instagram-style recipe grid |
| Plan | `/plans` | Calendar icon | Meal plans management |
| You | `/profile` | Person icon | Profile and settings |

---

## 6. Feature Specifications

### 6.1 Authentication & Onboarding

#### 6.1.1 Authentication (`/auth`)

- **Sign Up**: Name, email, password
- **Sign In**: Email, password
- **Provider**: Convex Auth with password-based authentication
- **Post-Auth Flow**: New users → Role Selection → Onboarding → Discover; Returning users → Discover

#### 6.1.2 Role Selection (`/role-select`)

- Two choices: **Chef** or **Food Lover**
- Chef selection opens the "Become a Chef" modal (bio, specialties)
- Both paths proceed to the onboarding carousel

#### 6.1.3 Onboarding Carousel (`/onboarding`)

- 3 informational slides:
  1. **Discover Global Flavors** — explore cuisines from around the world
  2. **Find Your Perfect Meal** — filter by dietary goals
  3. **Save & Plan Meals** — build weekly meal plans
- Skip button available; Next/Done progression
- Marks onboarding as complete on the user record

#### 6.1.4 Chef Onboarding (`/chef-onboarding`)

- Multi-step wizard for users upgrading to chef:
  1. Welcome cards (informational)
  2. About You (name, bio)
  3. Cuisines & Dietary Focus (country search, dietary tag selection)
- On completion, navigates to the recipe creation page

---

### 6.2 Discover (Home Feed)

**Route**: `/discover` (default landing page)

#### Components

| Component | Description |
|---|---|
| **CategoryStatusScroller** | Horizontal carousel of meal categories (Breakfast, Lunch, Dinner, Snack, Desserts) with images; ends with "Create meal plan" entry point |
| **CountryFilterScroller** | Horizontal scrollable chips for country filtering ("All" + country list with flags); infinite scroll loads 20 at a time |
| **Filter Button** | Opens FilterModal; shows badge with active filter count |
| **FeaturedRecipeCard List** | Vertical scrolling feed of recipe cards |
| **FilterModal** | Bottom-sheet with: country search, dietary tag multi-select, time of day, cooking duration |
| **CategoryStoryViewer** | Full-screen Instagram-style story viewer; auto-advances 5s per slide, progress bars, swipe navigation |

#### Recipe Card (FeaturedRecipeCard)

Each card displays:
- Recipe title
- Country name + flag SVG
- Cover image (376px tall, 20px border radius)
- Chef overlay pill (avatar + name, positioned top-left)
- Dietary icons in footer (up to 4 icons, cropped to hide SVG text)
- Star rating

#### Filtering

Supports simultaneous filters:
- **Country**: Single-select from country scroller or modal
- **Category**: Via category scroller (time-based default highlight)
- **Dietary Tags**: Multi-select (Halal, Vegan, Vegetarian, Protein, etc.)
- **Max Cooking Duration**: Duration cap filter

#### Data Source

- `useQuery(api.recipes.getFilteredRecipes)` with filter parameters
- Real-time Convex query (updates when new recipes are added)

---

### 6.3 Explore

**Route**: `/explore`

#### Layout

- Instagram-style 3-column grid with mixed square/tall cells
- `grid-auto-flow: dense` for gap-filling
- Tall cells: positions `index % 9 === 2` (right column) and `index % 9 === 5` (left column)

#### Interactions

- **Tap grid cell** → Bottom-sheet popup with recipe preview (image, title, country, description, chef info)
- **Tap popup CTA** → Navigate to `/recipe/:id`
- **Tap chef avatar** → Navigate to `/chef/:id`
- **Backdrop tap** → Close popup

#### Technical Notes

- Each grid cell is a separate `ExploreGridCell` subcomponent (needed for per-cell `useQuery` hooks)
- Search bar is UI-only (no filtering logic — deferred feature)
- Filter chips ("Dishes / Weight gain / Lose weight") are not yet implemented

---

### 6.4 Recipe Detail

**Route**: `/recipe/:id`

#### Layout Sections

1. **Hero Image**: Full-width cover image with gradient overlay, back button, save button
2. **Chef Info Row**: Chef avatar + name (links to `/chef/:id`)
3. **Title & Description**: Recipe name and description text
4. **Meta Row**: Prep time, cook time, portions, ingredient count, step count (as icon chips)
5. **Filter Chips**: Country chip (with flag) + dietary tag chips
6. **Nutrition Facts**: Circular progress indicators (calories, protein, carbs, fat) — placeholder data
7. **Ingredients List**: Numbered ingredient list; blurred/locked if not subscribed to the chef
8. **Action Buttons**: "Start cooking" (primary CTA), Save recipe
9. **Modals**: IngredientsModal (full list with lock notice for non-subscribers), NutritionModal (detailed breakdown)

#### Subscription Gating

- If the viewer is **not subscribed** to the recipe's chef:
  - Ingredient list is partially blurred (first 3 visible, rest locked)
  - "Start cooking" navigates to `/recipe/:id/paywall`
  - Ingredients modal shows lock notice linking to paywall
- If **subscribed** (or viewing own recipe):
  - Full ingredients visible
  - "Start cooking" navigates to `/recipe/:id/cook`

---

### 6.5 Cooking Mode (Recipe Steps)

**Route**: `/recipe/:id/cook`

#### Interface

- **Header**: Recipe title, step counter ("Step X of Y")
- **Hero Area**: Recipe image/video for the current step
- **Step Content**: Instruction text for current step
- **Step Dots**: Progress indicator showing current position
- **Navigation**: Previous / Next step buttons

#### Flow

1. User progresses through numbered instruction steps
2. On final step, "Next" navigates to `/recipe/:id/complete`
3. Payment success banner shown if `?payment=success` query param present (after subscription)

#### Recipe Complete (`/recipe/:id/complete`)

- Celebration icon and message
- Recipe/chef name attribution
- Star rating input (1–5)
- Action buttons: "Cook again" → `/recipe/:id/cook`, "Back to Discover" → `/discover`

---

### 6.6 Recipe Creation Wizard

**Route**: `/create` (authenticated chefs only)

#### Overview

An 8-step wizard with additional Rules of Upload and Upload Progress screens. Supports both create and edit mode (edit via `?edit=:id` query parameter).

#### Steps

| Step | Name | Fields | Validation |
|---|---|---|---|
| 1 | **Basics** | Cover image upload, title, description | All 3 required (3/3 counter) |
| 2 | **Ingredients** | Dynamic list: name, amount, unit per row; custom ingredient option | Minimum 3 ingredients |
| 3 | **Country** | Searchable country grid with flags | Single selection required |
| 4 | **Time** | Prep time picker (H:M:S), cook time picker (H:M:S) | At least one time > 0 |
| 5 | **Goal** | Multi-select weight goals (Build muscle, Gain weight, Lose weight, Eat healthy, Cheat day) | Optional |
| 6 | **Day** | Multi-select meal categories (Breakfast, Lunch, Dinner, Snack) | Optional |
| 7 | **Dietary** | Multi-select dietary tags (Halal, Vegan, Vegetarian, Kosher) | Optional |
| 8 | **Video** | Video upload, timeline-based segment editor | Video required |

#### Video Step — Timeline-Based Segment Editor

The video step features a sophisticated timeline editor:

1. Chef uploads a video file
2. `onLoadedMetadata` captures the video duration
3. Chef clicks the timeline to place **markers** (split points)
4. **Segments are derived** from markers via `useMemo` — not stored directly
5. Each segment has: title, notes, ingredient assignments
6. Markers have validation: no closer than 1s from edges or 2s from other markers
7. Playback indicator tracks current position (teal line with circular handle)
8. Split at playhead feature for precise splitting
9. Segments can be removed by clicking `×` (merges adjacent segments)

**Data Model**:
```
markers[] → deriveSegments() → videoParts[{startTime, endTime, name, notes, ingredients[]}]
```

#### Post-Wizard Screens

| Screen | Purpose |
|---|---|
| **Rules of Upload** | Content guidelines agreement (checkbox required before upload) |
| **Schedule Send** | Optional — set a future publish date/time |
| **Upload Progress** | Circular progress indicator; states: uploading → complete/failed |

#### After Upload

- **Success**: View created recipe (`/recipe/:id`) or upload another
- **Failure**: Retry or go back

---

### 6.7 Subscription & Paywall

**Route**: `/recipe/:id/paywall`

#### Paywall Screen

- Hero image from recipe
- Close button (back)
- Badge and heading ("Unlock all recipes by [Chef Name]")
- Benefits list (checkmarked items)
- **Pricing Toggle**: Monthly / Annual switch
- **CTA Button**: "Subscribe" → initiates Polar checkout
- Restore purchases button

#### Subscription Model

- **Per-chef subscriptions**: Users subscribe to individual chefs, not the platform
- **Plans**: Monthly and Annual (prices set by each chef)
- **Payment Processor**: Polar (Stripe-compatible)
- **Checkout Flow**: App → Polar hosted checkout page → Webhook callback → App

#### Chef Pricing Setup

- Chefs set monthly and annual prices in Profile Menu
- Prices are stored on the user record (`monthlyPrice`, `annualPrice`)
- Polar products are created via API (`createPolarProduct` action)
- Prices can be updated after initial setup (`updatePolarProductPrices` action)

#### Webhook Integration

- Endpoint: `POST /polar/webhook`
- Events handled:
  - `subscription.active` → Creates/updates subscription record
  - `subscription.canceled` → Updates status to canceled
  - `subscription.revoked` → Updates status to revoked

#### Access Control

- `isSubscribed` query checks: is the user the chef themselves, OR do they have an active subscription that hasn't expired
- Subscription grants access to all of that chef's recipes

---

### 6.8 Meal Planning

**Route**: `/plans` (list), `/plans/create` (wizard)

#### Plans List Page

- **Week Calendar Strip**: Monday–Sunday selector with formatted date header
- **Tabs**: "Your plans" and "Explore plans"
- **Your Plans Tab**: User's meal plans as cards (name, date, meal badges, dietary goal)
- **Explore Plans Tab**: Public plans from other users, grouped by meal type sections

#### Create Plan Wizard

| Step | Component | Description |
|---|---|---|
| 1 | **DietaryGoalStep** | Select a dietary goal (Build muscle, Gain weight, Lose weight, Eat healthy, Cheat day, Custom) |
| 2 | **MealsPerDayStep** | Select meals per day (1–7, or 7+) |
| 3 | **MealSlotsHub** | Shows meal slots to fill; tapping a slot opens BrowseRecipes overlay |

#### Browse Recipes Overlay

- Full-screen overlay with search bar and recipe grid
- Recipes filtered by meal category matching the slot
- Select a recipe → confirm → slot is filled
- Recipe grid cards show image with selected state

#### Meal Plan Data Structure

```
{
  name: string,
  dietaryGoal?: string,
  mealsPerDay?: number,
  creationMethod: "manual",
  meals: [{ type: "Breakfast", recipeId: Id<"recipes"> }, ...],
  date: "YYYY-MM-DD",
  isPublic: boolean
}
```

---

### 6.9 Chef Profiles

**Route**: `/chef/:id`

#### Layout

- **Header**: Back button
- **Profile Section**: Avatar, name, handle, editable bio (own profile only)
- **Stats**: Recipe count, subscriber count
- **Subscribe Button**: Subscribe/Unsubscribe (not shown on own profile)
- **Recipe Grid**: All recipes by this chef (clickable → `/recipe/:id`)

#### Interactions

- Subscribe → Navigates to paywall for the chef's first recipe (or Discover if no recipes)
- Unsubscribe → Removes subscription directly
- Edit bio → Inline edit with save/cancel (own profile only)

---

### 6.10 User Profile & Settings

#### 6.10.1 Profile Menu (`/profile`)

- **Avatar**: Tap to change photo (Convex file upload)
- **Name**: Editable inline
- **Handle**: Displayed (derived from username or name)
- **Share Button**: Links to `/profile/share`
- **Chef Pricing** (chef only): Monthly and annual price configuration
- **Menu Items**: My Dishes, Subscribers, Saved Ingredients, Purchases, Settings, Help, Rate App
- **Switch Account**: Popup with account list, opens `/auth` with `switchAccount` state
- **Logout**: Signs out, redirects to `/discover`

#### 6.10.2 Settings (`/profile/settings`)

Comprehensive settings page organized into sections:

| Section | Fields |
|---|---|
| **Account** | Avatar, name, username, bio, email, phone, password (change modal), linked accounts, language, region, logout, delete account |
| **Preferences** | Default serving size, measurement units (metric/imperial), dietary preferences (multi-select chips), cuisine interests (country chips with flags), flavor profile (Spicy/Sweet/Savory sliders), discover mode (Explore/Comfort) |
| **Notifications** | Master toggle + individual toggles: New recipes, New followers, Weekly suggestions, Meal reminders, Promotions |
| **Privacy & Data** | Clear search history, Clear cached data, AI personalization toggle |
| **App** | App version, Legal (expandable: Terms, Privacy, Community Guidelines, Creator Agreement, Cookie Policy, DMCA, Acceptable Use, Refund Policy), Help, Rate app |

#### 6.10.3 Share Page (`/profile/share`)

- Profile share URL with copy-to-clipboard
- Native Web Share API integration
- Social media quick-share icons: Instagram, Facebook, TikTok, X (Twitter), WhatsApp

#### 6.10.4 My Dishes (`/profile/dishes`) — Chef Only

- Grid of chef's uploaded recipes with images
- Edit overlay per dish → navigates to `/create?edit=:id`
- Delete overlay with confirmation
- Empty state: "No dishes yet" with create button
- Non-chef state: "Become a Chef" prompt with modal

#### 6.10.5 Additional Profile Pages

| Route | Page | Status |
|---|---|---|
| `/profile/subscribers` | Subscriber analytics | Placeholder ("Coming soon") |
| `/profile/ingredients` | Custom saved ingredients | Placeholder |
| `/profile/purchases` | Subscription purchases | Placeholder |
| `/profile/help` | Help & FAQ | Implemented (8 FAQs + contact email) |
| `/profile/rate` | Rate app | Implemented (star rating + review, localStorage) |

---

### 6.11 Country Browsing

**Route**: `/countries`

- Grid of country cards, each with flag and name
- Tapping a country navigates to `/discover?country=[name]` (filtered Discover feed)
- Countries sourced from the `countries` database table (seeded via `npx convex run seed:seedCountries`)

#### Available Countries with Flag SVGs

Ghana, China, Morocco, France, Nigeria, Malaysia, Senegal, Spain, Germany, Colombia, Brazil, America, England, Ivory Coast, Italy, Jamaica, Japan, Mexico, Argentina

---

### 6.12 Legal & Policy Pages

All legal pages follow a consistent template: header with back button, hero section, meta card (effective date, company, jurisdiction), numbered content sections.

| Route | Page |
|---|---|
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/community-guidelines` | Community Guidelines |
| `/creator-agreement` | Creator Agreement |
| `/cookie-policy` | Cookie Policy |
| `/dmca` | DMCA / Copyright Policy |
| `/acceptable-use` | Acceptable Use Policy |
| `/refund-policy` | Refund Policy |

These pages are publicly accessible (no authentication required).

---

## 7. Data Model

### 7.1 Database Tables

#### `users`

Extends Convex Auth's built-in user table with custom fields.

| Field | Type | Description |
|---|---|---|
| `name` | string? | Display name |
| `email` | string? | Email address |
| `phone` | string? | Phone number |
| `image` | string? | Auth provider avatar URL |
| `avatar` | string? | Uploaded avatar (Convex storage ID or URL) |
| `isChef` | boolean? | Whether user is a chef |
| `username` | string? | Unique username |
| `bio` | string? | Profile bio |
| `chefProfile` | object? | `{ bio, specialties[], countries[], dietaryTags[], verified }` |
| `preferences` | object? | Serving size, units, dietary prefs, cuisine interests, flavor sliders, discover mode, notification settings |
| `polarProductIdMonthly` | string? | Polar monthly product ID |
| `polarProductIdAnnual` | string? | Polar annual product ID |
| `monthlyPrice` | number? | Monthly subscription price (cents) |
| `annualPrice` | number? | Annual subscription price (cents) |
| `hasCompletedOnboarding` | boolean? | Onboarding status |
| `createdAt` | number? | Timestamp |

**Indexes**: `email`, `phone`, `by_chef`

#### `recipes`

| Field | Type | Description |
|---|---|---|
| `title` | string | Recipe name |
| `description` | string? | Recipe description |
| `imageUrl` | string | Cover image (storage ID or URL) |
| `country` | string | Country of origin |
| `countryFlag` | string | Country flag emoji |
| `chefId` | Id\<users\> | Creator reference |
| `tags` | string[] | Dietary/category tags |
| `category` | string | Meal category (Breakfast, Lunch, etc.) |
| `rating` | number | Star rating |
| `reviewCount` | number? | Number of reviews |
| `prepTime` | number? | Prep time in seconds |
| `cookTime` | number? | Cook time in seconds |
| `servings` | number? | Number of servings |
| `ingredients` | object[] | `[{ name, amount }]` |
| `instructions` | string[] | Step-by-step instructions |
| `savedBy` | Id\<users\>[] | Users who saved this recipe |
| `weightGoal` | string? | Target weight goal |
| `videoUrl` | string? | Video storage ID |
| `videoParts` | object[]? | `[{ name, notes, startTime, endTime, ingredients[] }]` |
| `scheduledAt` | number? | Scheduled publish timestamp |
| `status` | string? | "published" or "scheduled" |
| `createdAt` | number | Creation timestamp |

**Indexes**: `by_chef`, `by_country`, `by_category`, `by_rating`

#### `savedRecipes`

| Field | Type | Description |
|---|---|---|
| `userId` | Id\<users\> | User who saved |
| `recipeId` | Id\<recipes\> | Saved recipe |
| `savedAt` | number | Timestamp |

**Indexes**: `by_user`, `by_recipe`, `by_user_and_recipe`

#### `subscriptions`

| Field | Type | Description |
|---|---|---|
| `userId` | Id\<users\> | Subscribing user |
| `chefId` | Id\<users\> | Chef being subscribed to |
| `plan` | "monthly" \| "annual"? | Subscription plan |
| `subscribedAt` | number | Timestamp |
| `polarSubscriptionId` | string? | Polar subscription ID |
| `polarCustomerId` | string? | Polar customer ID |
| `status` | string? | active, canceled, revoked |
| `currentPeriodEnd` | number? | Period expiration |

**Indexes**: `by_user`, `by_chef`, `by_user_and_chef`, `by_polar_subscription`

#### `polarProductRequests`

| Field | Type | Description |
|---|---|---|
| `userId` | Id\<users\> | Requesting chef |
| `monthlyPrice` | number | Monthly price |
| `annualPrice` | number | Annual price |
| `productName` | string? | Product name |
| `createdAt` | number | Timestamp |

**Index**: `by_created`

#### `countries`

| Field | Type | Description |
|---|---|---|
| `name` | string | Country name |
| `code` | string | ISO 3166-1 alpha-2 code |
| `flagEmoji` | string | Flag emoji |

**Indexes**: `by_name`, `by_code`

#### `mealPlans`

| Field | Type | Description |
|---|---|---|
| `userId` | Id\<users\> | Plan owner |
| `name` | string | Plan name |
| `dietaryGoal` | string? | Goal label |
| `mealsPerDay` | number? | Meals per day |
| `creationMethod` | string? | "manual" (or "ai" when enabled) |
| `isPublic` | boolean? | Whether plan is publicly visible |
| `meals` | object[] | `[{ type, recipeId? }]` |
| `date` | string | "YYYY-MM-DD" |
| `createdAt` | number | Timestamp |

**Indexes**: `by_user`, `by_user_and_date`, `by_public`

---

## 8. Backend API Surface

### 8.1 Queries (20 total)

| Module | Function | Auth | Description |
|---|---|---|---|
| `recipes` | `getAllRecipes` | Public | All recipes (limit 100), newest first, with chef info |
| `recipes` | `getFilteredRecipes` | Public | Filtered by country, category, tags, maxDuration |
| `recipes` | `getRecipesByCountry` | Public | Recipes for a specific country (limit 50) |
| `recipes` | `getRecipesByCategory` | Public | Recipes by meal category (limit 50) |
| `recipes` | `getRecipesByTags` | Public | Recipes matching any of provided tags (limit 200) |
| `recipes` | `getRecipesByChef` | Public | All recipes by a specific chef (limit 50) |
| `recipes` | `getFeaturedRecipes` | Public | Highest-rated recipes (limit 10) |
| `recipes` | `getTimeOfDayRecipes` | Public | 6 recipes matching current meal time |
| `recipes` | `getRecipeById` | Public | Single recipe with chef info |
| `recipes` | `isRecipeSaved` | Public | Check if recipe is saved by user |
| `recipes` | `getMyRecipes` | Auth | Current user's recipes (limit 50) |
| `recipes` | `getMySavedRecipes` | Auth | Current user's saved recipes with details |
| `recipes` | `getStorageUrl` | Public | Resolve Convex storage ID to URL |
| `subscriptions` | `isSubscribed` | Auth | Check if user is subscribed to a chef |
| `subscriptions` | `getSubscriberCount` | Public | Count of subscribers for a chef |
| `users` | `currentUser` | Auth | Current authenticated user |
| `users` | `getUser` | Public | User by ID |
| `users` | `getChefPricing` | Public | Chef's subscription pricing |
| `countries` | `getAllCountries` | Public | All countries, alphabetically sorted |
| `mealPlans` | `getUserPlans` | Auth | Current user's meal plans with recipes |
| `mealPlans` | `getPlanForDate` | Auth | Meal plan for a specific date |
| `mealPlans` | `getExplorePlans` | Optional | Public plans from other users (limit 50) |

### 8.2 Mutations (19 total)

| Module | Function | Auth | Description |
|---|---|---|---|
| `recipes` | `createRecipe` | Chef | Create a new recipe |
| `recipes` | `updateRecipe` | Owner | Update own recipe |
| `recipes` | `deleteRecipe` | Owner | Delete own recipe |
| `recipes` | `toggleSaveRecipe` | Auth | Save/unsave a recipe |
| `recipes` | `generateUploadUrl` | Auth | Get Convex storage upload URL |
| `subscriptions` | `unsubscribe` | Auth | Remove subscription to a chef |
| `users` | `becomeChef` | Auth | Upgrade to chef role |
| `users` | `updateUserProfile` | Auth | Update basic profile (name, avatar) |
| `users` | `updateSettings` | Auth | Update settings and preferences |
| `users` | `updateChefProfile` | Chef | Update chef-specific profile |
| `users` | `completeOnboarding` | Auth | Mark onboarding complete |
| `users` | `setOnboardingPending` | Auth | Mark onboarding pending |
| `users` | `deleteAccount` | Auth | Delete user account |
| `mealPlans` | `createMealPlan` | Auth | Create a new meal plan |
| `mealPlans` | `assignRecipeToSlot` | Owner | Assign recipe to meal slot |
| `mealPlans` | `deleteMealPlan` | Owner | Delete a meal plan |
| `mealPlans` | `togglePlanPublic` | Owner | Toggle plan public visibility |
| `polarServer` | `startPolarProductSetup` | Auth | Begin Polar product creation |
| `seed` | `seedRecipes` | N/A | Seed sample recipes (CLI only) |
| `seed` | `seedCountries` | N/A | Seed country data (CLI only) |

### 8.3 Actions (3 total)

| Module | Function | Description |
|---|---|---|
| `polar` | `createPolarProduct` | Create monthly + annual Polar products for a chef |
| `polar` | `updatePolarProductPrices` | Update prices on existing Polar products |
| `polar` | `createCheckoutSession` | Generate Polar checkout URL for subscription |

### 8.4 HTTP Endpoints

| Method | Path | Handler | Description |
|---|---|---|---|
| POST | `/polar/webhook` | `handlePolarWebhook` | Polar subscription webhook receiver |
| Various | `/api/auth/*` | Convex Auth | Authentication endpoints |

---

## 9. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | React | 19.2.0 |
| **Routing** | React Router DOM | 7.13.0 |
| **Backend & Database** | Convex | 1.31.7 |
| **Authentication** | @convex-dev/auth | 0.0.90 |
| **Payments** | Polar (external API) | — |
| **Build Tool** | Vite | 7.3.1 |
| **Language** | TypeScript | 5.9.3 |
| **Linting** | ESLint | 9.39.1 |
| **Styling** | Plain CSS (co-located) | — |
| **File Storage** | Convex Storage | Built-in |

### Key Architecture Decisions

- **No CSS framework**: All styling is hand-written, co-located CSS files per component/page
- **No state management library**: Component-level state + Convex reactive queries
- **No REST API**: All data access through Convex queries/mutations (real-time by default)
- **Single video + metadata**: Recipes store one video file with an array of `{startTime, endTime}` segments (no video splitting)
- **Per-chef subscriptions**: Revenue model is creator-centric (subscribe to chefs, not the platform)

---

## 10. Navigation & Routing

### 10.1 Route Table

| Route | Component | Auth | Description |
|---|---|---|---|
| `/auth` | Auth | Public | Sign in / sign up |
| `/discover` | Discover | Public | Home feed (default route) |
| `/explore` | Explore | Public | Recipe grid |
| `/role-select` | RoleSelection | Auth | Post-signup role selection |
| `/onboarding` | Onboarding | Auth | Tips carousel |
| `/create` | CreateRecipe | Auth + Chef | Recipe creation wizard |
| `/chef-onboarding` | ChefOnboarding | Auth | Become a chef wizard |
| `/recipe/:id` | RecipeDetail | Auth | Recipe detail page |
| `/recipe/:id/paywall` | Paywall | Auth | Subscription paywall |
| `/recipe/:id/cook` | RecipeSteps | Auth | Step-by-step cooking |
| `/recipe/:id/complete` | RecipeComplete | Auth | Cooking completion |
| `/countries` | AllCountries | Auth | Country browser |
| `/chef/:id` | ChefProfile | Auth | Chef's public profile |
| `/plans` | Plans | Auth | Meal plans list |
| `/plans/create` | CreatePlan | Auth | Create meal plan wizard |
| `/profile` | ProfileMenu | Auth | Profile menu |
| `/profile/share` | SharePage | Auth | Share profile |
| `/profile/dishes` | MyDishes | Auth | Chef's recipes |
| `/profile/subscribers` | Subscribers | Auth | Subscriber analytics (placeholder) |
| `/profile/settings` | ProfileSettings | Auth | Settings |
| `/profile/help` | ProfileHelp | Auth | Help & FAQ |
| `/profile/ingredients` | ProfileIngredients | Auth | Saved ingredients (placeholder) |
| `/profile/purchases` | ProfilePurchases | Auth | Purchases (placeholder) |
| `/profile/rate` | RateApp | Auth | Rate the app |
| `/design` | DesignSystem | Public | Design system reference |
| `/terms` | TermsOfService | Public | Terms of service |
| `/privacy` | PrivacyPolicy | Public | Privacy policy |
| `/community-guidelines` | CommunityGuidelines | Public | Community guidelines |
| `/creator-agreement` | CreatorAgreement | Public | Creator agreement |
| `/cookie-policy` | CookiePolicy | Public | Cookie policy |
| `/dmca` | DMCACopyrightPolicy | Public | DMCA policy |
| `/acceptable-use` | AcceptableUsePolicy | Public | Acceptable use policy |
| `/refund-policy` | RefundPolicy | Public | Refund policy |
| `*` | — | — | Redirects to `/discover` |

### 10.2 Navigation Patterns

- **Back buttons**: Always use `navigate(-1)` (never hardcoded routes)
- **Exception**: Wizard steps use internal `prevStep()` function
- **Bottom nav**: Persistent on main pages (Discover, Explore, Plans, Profile)
- **Floating Action Button**: Visible on Discover/Explore, routes to `/create` (chefs) or `/chef-onboarding` (non-chefs)
- **Auth guard**: `RequireAuth` wrapper checks authentication and onboarding status; redirects to `/auth` or `/role-select` as needed

---

## 11. Design System Summary

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Brand Primary | `#20b2aa` | Buttons, active states, links, toggles |
| Nav Background | `#1CC8EA` | Bottom navigation bar |
| Nav Active | `#004d40` | Active nav icon |
| Text Primary | `#333` | Body text, headings |
| Text Secondary | `#666` | Descriptions, subtitles |
| Text Muted | `#999` | Labels, metadata |
| Danger | `#e53e3e` | Delete actions, errors |
| Surface Page | `#f5f5f5` | Page backgrounds |
| Surface Card | `#ffffff` | Card backgrounds |

### Typography

- Font: `system-ui, Avenir, Helvetica, Arial, sans-serif`
- Card titles: `1.5rem / 700`
- Section labels: `0.8rem / 700 / uppercase / #20b2aa`
- Body text: `0.9rem / 500 / #333`
- Chip text: `0.82rem / 500 / #555`

### Component Patterns

- **Cards**: `border-radius: 14px`, white background, subtle shadow
- **Chips/Pills**: `border-radius: 20px`, 1.5px border, inline-flex with icon + text
- **Buttons (CTA)**: `border-radius: 25px`, teal background, white text
- **Modals**: Fixed backdrop with centered or bottom-sheet card, slide-up animation
- **Avatars**: `border-radius: 50%`, sizes: 28px (overlay), 44px (detail), 80px (profile)
- **Scrollbars**: Globally hidden

### Asset Conventions

- **Country flags**: `src/assets/flags/Mini flags/[Country].svg` — always show flag, never abbreviation
- **Dietary icons**: `src/assets/Dietaryicons/[Name].svg` — crop SVG text via overflow hidden, show icon only
- **Dish images**: `src/assets/Dishes/` — organized by cuisine
- **Logo**: `src/assets/Logo/` — black and white variants
- **Bottom bar icons**: `src/assets/Bottom bar/` — light and selected states

---

## 12. Deferred / Hidden Features

These features exist in code but are intentionally hidden or incomplete:

| Feature | Status | Notes |
|---|---|---|
| **AI Meal Plan Creation** | Hidden | `ChooseMethod` step 0 exists but is skipped; `creationMethod` defaults to `'manual'`. Do not remove code. |
| **Explore Search Bar** | UI-only | Search input renders on `/explore` but has no filtering logic |
| **Explore Filter Chips** | Not implemented | "Dishes / Weight gain / Lose weight" chips are designed but not built |
| **Subscribers Analytics** | Placeholder | `/profile/subscribers` shows "Coming soon" |
| **Purchases View** | Placeholder | `/profile/purchases` shows stub message |
| **Custom Ingredients Library** | Placeholder | `/profile/ingredients` has empty state only |
| **Recipe Comments/Likes** | Not implemented | Mentioned in overview but not in current codebase |
| **Push Notifications** | Not implemented | Toggle settings exist but no notification infrastructure |
| **AI Personalization** | Not implemented | Toggle exists in settings but no backend logic |
| **Infinite Scroll on Discover** | Not implemented | Feed loads all recipes at once (limit 100) |
| **Recipe Scheduling** | Partial | `scheduledAt` field exists; Schedule Send modal works; no cron job to auto-publish |

---

## 13. Non-Functional Requirements

### Performance

- Convex provides real-time reactive queries (automatic UI updates when data changes)
- Recipe queries are limited (50–200 per query) to manage payload size
- Country filter scroller lazy-loads 20 countries at a time via intersection observer
- Images use Convex storage URLs (CDN-backed)

### Security

- All user-facing mutations require authentication via Convex Auth
- Owner-only operations (edit/delete recipe, manage meal plan) verify ownership server-side
- Polar webhooks verify signature before processing
- No secrets in client-side code (Convex environment variables for API keys)

### Reliability

- Image loading: `ImageWithFallback` component with inline SVG fallback (no external dependencies)
- Storage ID resolution: Guard pattern prevents passing HTTP URLs to `getStorageUrl`
- Hook safety: All `useQuery`/`useMutation` calls hoisted above early returns; conditional queries use `"skip"`
- Error states: Upload progress screen has retry capability

### Accessibility

- Back buttons include `aria-label="Back"`
- Images include alt text
- Tappable rows have minimum 48px height
- Form inputs have labels/placeholders

### Mobile-First

- Responsive layout targeting phone screens
- Touch-friendly interaction targets
- Bottom navigation bar with 20px top border radius
- 80px bottom padding on pages for nav clearance
- Native share API integration on supported platforms

---

## 14. Open Questions & Future Considerations

### Short-Term

1. **Search functionality**: Wire Explore search bar to recipe filtering
2. **Pagination**: Implement infinite scroll / cursor-based pagination on Discover feed
3. **Recipe scheduling**: Build cron job to auto-publish scheduled recipes
4. **Notification infrastructure**: Connect notification toggles to a push notification service

### Medium-Term

5. **AI meal plan creation**: Enable the hidden AI method in CreatePlan wizard
6. **Recipe comments and social features**: Like, comment, share on individual recipes
7. **Subscriber analytics dashboard**: Revenue tracking, subscriber growth charts for chefs
8. **Saved recipes page**: Dedicated page to view all saved recipes (query exists: `getMySavedRecipes`)
9. **Purchase history**: Show subscription receipts and management

### Long-Term

10. **AI-based discovery**: Personalized recipe recommendations based on preferences and behavior
11. **Revenue sharing**: Platform commission structure for chef subscriptions
12. **PWA installation**: Service worker, offline support, app manifest
13. **Internationalization (i18n)**: Multi-language support (language/region fields exist in preferences)
14. **Video streaming optimization**: Adaptive bitrate streaming for recipe videos
15. **Social features**: Follow chefs (without subscribing), activity feed, recipe sharing

---

## Component Inventory

### Pages (33)

| Page | File | Category |
|---|---|---|
| Auth | `Auth.tsx` | Authentication |
| RoleSelection | `RoleSelection.tsx` | Onboarding |
| Onboarding | `Onboarding.tsx` | Onboarding |
| ChefOnboarding | `ChefOnboarding.tsx` | Onboarding |
| Discover | `Discover.tsx` | Core |
| Explore | `Explore.tsx` | Core |
| RecipeDetail | `RecipeDetail.tsx` | Recipe Flow |
| RecipeSteps | `RecipeSteps.tsx` | Recipe Flow |
| RecipeComplete | `RecipeComplete.tsx` | Recipe Flow |
| Paywall | `Paywall.tsx` | Subscription |
| CreateRecipe | `CreateRecipe.tsx` | Creation |
| Plans | `Plans.tsx` | Meal Planning |
| CreatePlan | `CreatePlan.tsx` | Meal Planning |
| AllCountries | `AllCountries.tsx` | Browsing |
| ChefProfile | `ChefProfile.tsx` | Profiles |
| ProfileMenu | `ProfileMenu.tsx` | Profile |
| ProfileSettings | `ProfileSettings.tsx` | Profile |
| MyDishes | `MyDishes.tsx` | Profile |
| Subscribers | `Subscribers.tsx` | Profile |
| ProfileIngredients | `ProfileIngredients.tsx` | Profile |
| ProfilePurchases | `ProfilePurchases.tsx` | Profile |
| ProfileHelp | `ProfileHelp.tsx` | Profile |
| SharePage | `SharePage.tsx` | Profile |
| RateApp | `RateApp.tsx` | Profile |
| DesignSystem | `DesignSystem.tsx` | Internal |
| TermsOfService | `TermsOfService.tsx` | Legal |
| PrivacyPolicy | `PrivacyPolicy.tsx` | Legal |
| CommunityGuidelines | `CommunityGuidelines.tsx` | Legal |
| CreatorAgreement | `CreatorAgreement.tsx` | Legal |
| CookiePolicy | `CookiePolicy.tsx` | Legal |
| DMCACopyrightPolicy | `DMCACopyrightPolicy.tsx` | Legal |
| AcceptableUsePolicy | `AcceptableUsePolicy.tsx` | Legal |
| RefundPolicy | `RefundPolicy.tsx` | Legal |

### Shared Components (40)

| Component | Directory | Purpose |
|---|---|---|
| BottomNavigation | `components/` | App-wide bottom navigation |
| CategoryStatusScroller | `components/` | Category carousel on Discover |
| CategoryStoryViewer | `components/` | Instagram-style story viewer |
| CategoryRecipesModal | `components/` | Category recipe browser |
| CountryFilterScroller | `components/` | Country filter chips |
| CountryRecipeCard | `components/` | Compact recipe card |
| DietFilterScroller | `components/` | Dietary filter chips |
| FeaturedRecipeCard | `components/` | Home feed recipe card |
| FilterModal | `components/` | Discover filter bottom sheet |
| FloatingActionButton | `components/` | Create recipe FAB |
| HorizontalRecipeCarousel | `components/` | Horizontal recipe scroll |
| ImageWithFallback | `components/` | Image with error fallback |
| RequireAuth | `components/` | Auth guard wrapper |
| SectionHeader | `components/` | Section title + "View all" |
| BecomeChefModal | `components/` | Chef upgrade modal |
| IngredientsModal | `components/recipe/` | Ingredients popup |
| NutritionModal | `components/recipe/` | Nutrition facts popup |
| StepBasics | `components/create/` | Wizard: cover image, title, description |
| StepIngredients | `components/create/` | Wizard: ingredient list |
| StepCountry | `components/create/` | Wizard: country selection |
| StepTime | `components/create/` | Wizard: time pickers |
| StepGoal | `components/create/` | Wizard: weight goal selection |
| StepDay | `components/create/` | Wizard: meal category selection |
| StepDietary | `components/create/` | Wizard: dietary tag selection |
| StepVideo | `components/create/` | Wizard: video + timeline editor |
| WizardNav | `components/create/` | Wizard navigation buttons |
| WizardStepper | `components/create/` | Wizard step indicator |
| RulesOfUpload | `components/create/` | Upload content guidelines |
| UploadProgress | `components/create/` | Upload progress screen |
| ScheduleSend | `components/create/` | Schedule publish modal |
| CustomIngredient | `components/create/` | Custom ingredient form |
| ChooseMethod | `components/plans/` | Plan creation method (AI hidden) |
| DietaryGoalStep | `components/plans/` | Plan dietary goal picker |
| MealsPerDayStep | `components/plans/` | Plan meals-per-day picker |
| MealSlotsHub | `components/plans/` | Plan meal slot manager |
| BrowseRecipes | `components/plans/` | Recipe browser for plan slots |
| RecipeGridCard | `components/plans/` | Recipe grid card with selection |
| PlanCard | `components/plans/` | Plan list card |
| MealSection | `components/plans/` | Meal type section display |
| WeekCalendarStrip | `components/plans/` | Week day selector |

### Backend Modules (10)

| File | Purpose |
|---|---|
| `schema.ts` | Database schema definition |
| `recipes.ts` | Recipe CRUD and queries |
| `subscriptions.ts` | Subscription management |
| `users.ts` | User profile management |
| `countries.ts` | Country data queries |
| `mealPlans.ts` | Meal plan CRUD |
| `polar.ts` | Polar payment actions |
| `polarServer.ts` | Polar product management |
| `polarWebhook.ts` | Polar webhook handler |
| `seed.ts` | Database seeding |
| `auth.ts` | Authentication config |
| `http.ts` | HTTP route setup |
