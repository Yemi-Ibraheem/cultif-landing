# Create Flow — Requested Changes

> Changes to review and implement for the Create Recipe wizard.
> Once reviewed, these will be executed and this file can be archived.

---

## Change 1: Ingredients — Split amount into number + unit dropdown

**File:** `src/components/create/StepIngredients.tsx`
**Also affects:** `convex/schema.ts` (ingredient shape), `CreateRecipe.tsx` (form data)

**Current:** Single text input for `amount` (e.g. "2 cups")

**Requested:** Split into two fields:
1. **Number input** — the quantity (e.g. `2`)
2. **Dropdown select** — the unit/metric (e.g. `g`, `ml`, `cups`, `tbsp`, etc.)

**Example:** Sugar → `2` → `g` (grams)

**Metrics to include:**
- g (grams), kg (kilograms)
- ml (millilitres), l (litres)
- tsp (teaspoon), tbsp (tablespoon)
- cups, pieces, pinch, bunch, cloves, slices
- oz (ounces), lb (pounds)

---

## Change 2: Country — Search bar + flag images instead of emoji abbreviations

**File:** `src/components/create/StepCountry.tsx`, `StepCountry.css`

**Current:** Grid of 18 country cards using emoji flags, all visible at once.

**Requested:**
1. Replace emoji abbreviations with **actual flag images** from `src/assets/flags/Mini flags/`
2. Only show **3 country cards visible** at a time (scrollable or filtered)
3. Add a **search bar at the top** — as the user types, narrow down the country buttons below to match

---

## Change 3: Goal + Day — Multi-selection instead of single

**Files:** `src/components/create/StepGoal.tsx`, `src/components/create/StepDay.tsx`
**Also affects:** `CreateRecipe.tsx` (form data types), `convex/schema.ts`

**Current:** Both are single-select radio buttons (one selection only).

**Requested:** Both should support **multi-selection** (checkboxes instead of radios). A dish can be tagged with multiple goals (e.g. "Build muscle" + "Eat healthy") and multiple meal times (e.g. "Lunch" + "Dinner").

**Data type change:**
- `weightGoal: string` → `weightGoals: string[]`
- `category: string` → `categories: string[]`

---

## Change 4: Dietary step — Video CTA + Next/Schedule on same row

**File:** `src/components/create/StepDietary.tsx`, `StepDietary.css`
**Also affects:** `CreateRecipe.tsx` (WizardNav rendering for step 7)

**Current:** "Upload video" button + "Schedule send" link stacked vertically, with separate Next button from WizardNav.

**Requested:**
1. "Upload video" button stays as-is, BUT once a video is selected the label changes to **"Change Video"**
2. Below the dietary tags and video button: **"Next →"** and **"⏰ Schedule send"** should be on the **same row**, both reduced in size so they fit side by side
3. The WizardNav component should NOT render its own Next button for step 7 — Step 7 handles its own bottom actions

---

## Change 5: Recipe Detail page — "View dish" destination

**Files:** NEW `src/pages/RecipeDetail.tsx`, `src/pages/RecipeDetail.css`
**Also affects:** `src/App.tsx` (add route), `CreateRecipe.tsx` (navigate to recipe)

**Current:** "View dish" button navigates to `/discover` (placeholder).

**Requested:** Build the **Recipe Detail page** (`/recipe/:id`) so "View dish" navigates there.

**Figma ref:** `src/UserFlows/Create 3.png` (rightmost screen — "Dish")

**Layout from Figma:**
- Hero image (full width)
- Back arrow + chef name header
- **"Start cooking →"** CTA button (green, right-aligned)
- Chef name + Dish title
- Prep time (clock icon) + portions (fork icon)
- **Nutrition facts** section: Protein, Carbs, Calories, Fat shown as percentage-of-goals circles with gram values. "Full nutrition >" link
- **Ingredients** list: each row has ingredient image (circular), name, amount with unit, and a chevron (>)

---

## Change 6: Discover feed — Use cover image + proper flags

**Files:** `src/pages/Discover.tsx`, related card components
**Also affects:** `src/components/CountryRecipeCard.tsx`, `src/components/FeaturedRecipeCard.tsx`

**Current:** Country recipe cards in the "Taste by Country" carousel may show text abbreviations (e.g. "TH") instead of actual flag images. Mock data uses hardcoded images.

**Requested:**
1. When a recipe is uploaded via the Create flow, its **cover image** should appear as the small image in the country carousel card
2. Always use the **actual flag SVG** from `src/assets/flags/Mini flags/` instead of text abbreviations like "TH"
3. Ensure newly created recipes appear in the Discover feed with proper images and flags

---

## Implementation Order (suggested)

1. **Change 3** — Goal + Day multi-select (simple refactor)
2. **Change 1** — Ingredients number + unit split (schema + UI)
3. **Change 2** — Country search + flags (UI rework)
4. **Change 4** — Dietary step layout (UI rework)
5. **Change 5** — Recipe Detail page (new page)
6. **Change 6** — Discover feed integration (wiring)
