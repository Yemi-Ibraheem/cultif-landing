
# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Cultif 0.2
- **Date:** 2026-02-28
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

---

### Requirement: Discover Feed
- **Description:** Home feed showing recipe cards filterable by country, dietary tags, category, and cook time.

#### Test TC001 Browse Discover feed scrollers and open filter modal
- **Test Code:** [TC001_Browse_Discover_feed_scrollers_and_open_filter_modal.py](./TC001_Browse_Discover_feed_scrollers_and_open_filter_modal.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/fd6389ff-d316-4c84-a95e-28e8b3d63fc0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Category scroller, country filter scroller, and filter modal all rendered correctly and were interactable.

---

#### Test TC002 Apply multiple filters and see filtered results on the feed
- **Test Code:** [TC002_Apply_multiple_filters_and_see_filtered_results_on_the_feed.py](./TC002_Apply_multiple_filters_and_see_filtered_results_on_the_feed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/7aef39e5-42ec-487c-bcdc-13bb969ece27
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Dietary, category, country, and max-duration filters applied successfully. Feed updated correctly with filtered results.

---

#### Test TC003 Apply filters that return no recipes and verify empty state
- **Test Code:** [TC003_Apply_filters_that_return_no_recipes_and_verify_empty_state.py](./TC003_Apply_filters_that_return_no_recipes_and_verify_empty_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/051fc718-d1fc-4a3c-81cb-664cbd7e4066
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** When no recipes match the selected filters, the "No recipes match your filters" empty state message displays correctly.

---

### Requirement: Explore Grid
- **Description:** Instagram-style 3-column image grid with tall/square cells and bottom-sheet recipe previews.

#### Test TC008 Open a recipe preview bottom sheet from the Explore grid
- **Test Code:** [TC008_Open_a_recipe_preview_bottom_sheet_from_the_Explore_grid.py](./TC008_Open_a_recipe_preview_bottom_sheet_from_the_Explore_grid.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/f3df389b-5e82-405f-bb30-39e45b7d27aa
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Tapping a grid cell successfully opens the recipe preview bottom sheet overlay.

---

#### Test TC009 Dismiss the recipe preview bottom sheet by tapping outside
- **Test Code:** [TC009_Dismiss_the_recipe_preview_bottom_sheet_by_tapping_outside.py](./TC009_Dismiss_the_recipe_preview_bottom_sheet_by_tapping_outside.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/95c4e044-de9c-4778-ae6f-c92cf73302c1
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Tapping the backdrop outside the bottom sheet correctly dismisses the overlay.

---

#### Test TC010 Navigate to recipe detail from bottom sheet using View Recipe
- **Test Code:** [TC010_Navigate_to_recipe_detail_from_bottom_sheet_using_View_Recipe.py](./TC010_Navigate_to_recipe_detail_from_bottom_sheet_using_View_Recipe.py)
- **Test Error:** View Recipe button not found to be clickable; click attempts on interactive elements 905, 924, and 1348 returned 'element not interactable' or became stale. Navigation to the recipe detail page did not occur; current URL remains http://localhost:5173/explore after all attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/36783b2f-cdb4-4054-b4ff-d08b8b6545f9
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The "View Recipe" button inside the Explore bottom sheet is rendered but not interactable. This is likely a `pointer-events`, z-index stacking, or element staleness issue in the bottom sheet card. The button may be covered by an overlay layer or the card is re-rendering and causing the element reference to go stale before the click registers.

---

### Requirement: Recipe Detail
- **Description:** Full recipe page with cover image, chef info, ingredients modal (locked behind subscription), and Cook Now button.

#### Test TC015 Recipe Detail displays core recipe content (cover image/title/description)
- **Test Code:** [TC015_Recipe_Detail_displays_core_recipe_content_cover_imagetitledescription.py](./TC015_Recipe_Detail_displays_core_recipe_content_cover_imagetitledescription.py)
- **Test Error:** No recipes present in feed — page displays "No recipes available yet. Check back soon or seed some sample recipes!" Recipe card not available to click.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/217f402d-9847-4138-b84a-2c9e25196b7e
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** The test environment has no seeded recipe data for this test user account. The Discover feed shows the empty-state message. This is a test environment data issue, not a code bug. Run `npx convex run seed:seedRecipes` while authenticated to populate recipes.

---

#### Test TC018 Cook Now from Recipe Detail routes to cooking steps screen
- **Test Code:** [TC018_Cook_Now_from_Recipe_Detail_routes_to_cooking_steps_screen.py](./TC018_Cook_Now_from_Recipe_Detail_routes_to_cooking_steps_screen.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/bbded765-68a9-4233-8c0c-6411df441297
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Tapping Cook Now from the Recipe Detail page correctly navigates to the `/recipe/:id/cook` cooking steps route.

---

#### Test TC013 Subscribed user can view full ingredients and start cooking from Recipe Detail
- **Test Code:** [TC013_Subscribed_user_can_view_full_ingredients_and_start_cooking_from_Recipe_Detail.py](./TC013_Subscribed_user_can_view_full_ingredients_and_start_cooking_from_Recipe_Detail.py)
- **Test Error:** Ingredients modal displays "Subscribe to see all ingredients" even for a subscribed user. Full ingredients list is not accessible; Cook Now flow was not reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/03837137-781d-400e-9e56-4c057b046d44
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The subscription check in the IngredientsModal (or RecipeDetail) is not recognising an active subscription. A subscribed user still sees the paywall notice instead of the full ingredient list. This suggests the subscription status query either returns the wrong value or the conditional rendering logic has an inverted/incorrect check.

---

#### Test TC014 Not subscribed user sees ingredients paywall notice and can open paywall from Recipe Detail
- **Test Code:** [TC014_Not_subscribed_user_sees_ingredients_paywall_notice_and_can_open_paywall_from_Recipe_Detail.py](./TC014_Not_subscribed_user_sees_ingredients_paywall_notice_and_can_open_paywall_from_Recipe_Detail.py)
- **Test Error:** Could not click the "Subscribe to see all ingredients" notice; click attempts on element indexes 1809 and 2198 failed (element not interactable or became stale). Page became blank after click attempts.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/c2abed8d-1464-4aaf-a567-188bb08d9c46
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The "Subscribe to see all ingredients" `<Link>` in IngredientsModal is not interactable by the test runner. The element may be covered by the modal overlay's own backdrop or have a `pointer-events: none` style applied. This is a critical navigation path — unsubscribed users cannot reach the Paywall from the ingredient modal.

---

### Requirement: Paywall / Subscription
- **Description:** Subscription gate for accessing premium recipe content, with monthly and annual plan options.

#### Test TC020 Open paywall and view chef info and pricing options
- **Test Code:** [TC020_Open_paywall_and_view_chef_info_and_pricing_options.py](./TC020_Open_paywall_and_view_chef_info_and_pricing_options.py)
- **Test Error:** Subscription element not found on the recipe detail page for an authenticated user. Text "Monthly" not found on the recipe detail/paywall page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/dff08207-d323-4155-9920-9bfcc00d0192
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The paywall page is not displaying subscription pricing options. This could be because the chef's Polar pricing products have not been set up for the test chef account, or because the paywall page conditionally hides pricing when `polarProductIdMonthly`/`polarProductIdAnnual` are null.

---

#### Test TC021 Select Monthly plan and initiate subscription
- **Test Code:** [TC021_Select_Monthly_plan_and_initiate_subscription.py](./TC021_Select_Monthly_plan_and_initiate_subscription.py)
- **Test Error:** Auth page did not render — page is blank and contains 0 interactive elements. Email input field not found on /auth.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/53615a78-69e9-426f-9811-d85d1b13f1b5
- **Status:** ❌ Failed
- **Severity:** CRITICAL
- **Analysis / Findings:** The `/auth` page rendered blank with no interactive elements. This is likely caused by Convex's `<AuthLoading>` component blocking the auth form from rendering while the SDK hydrates. The auth form only renders after the Convex auth state is resolved; if the loading state never clears (e.g. slow network in CI), the page stays blank indefinitely. This is a critical reliability issue affecting all tests that require login.

---

#### Test TC022 Select Annual plan and initiate subscription
- **Test Code:** [TC022_Select_Annual_plan_and_initiate_subscription.py](./TC022_Select_Annual_plan_and_initiate_subscription.py)
- **Test Error:** Subscribe button not found or not interactable after multiple attempts. Selecting the Annual plan did not open any subscription modal.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/b622aca6-4b9d-4519-aaaa-5250d387cb20
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The subscription button on the Paywall page is either not rendering (because Polar pricing hasn't been set up for the test chef), or becomes stale before the click. Likely a downstream consequence of the missing Polar product setup issue identified in TC020.

---

#### Test TC025 Payment failure shows an error and allows retry (Monthly plan)
- **Test Code:** [TC025_Payment_failure_shows_an_error_and_allows_retry_Monthly_plan.py](./TC025_Payment_failure_shows_an_error_and_allows_retry_Monthly_plan.py)
- **Test Error:** Payment failed message not displayed. Application navigated to /profile instead of showing a checkout error. No retry UI was found.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/d094011d-2921-44f8-84d3-99bce5c1684a
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** On a failed payment/subscription attempt, the app silently navigates to `/profile` with no error message or retry prompt shown to the user. The error handling path in the Paywall subscription flow should display a user-facing error state with a retry option rather than a silent redirect.

---

### Requirement: Recipe Cooking Steps
- **Description:** Step-by-step cooking instructions with video segments after subscription check.

#### Test TC028 Advance through cooking steps to completion screen
- **Test Code:** [TC028_Advance_through_cooking_steps_to_completion_screen.py](./TC028_Advance_through_cooking_steps_to_completion_screen.py)
- **Test Error:** Step-by-step cooking flow could not be accessed — a paywall page was displayed after clicking "Start cooking →". Current page showed subscription/purchase controls instead of cooking step UI.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/bed83353-848b-457a-8a1b-1c68339f8bed/c612f637-69a2-4f0b-ae98-dd84b4df4169
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** The test user does not have an active subscription, so clicking Cook Now redirects to the paywall instead of the cooking steps. This is expected behaviour for an unsubscribed user — however, the test was intended to run for a subscribed user. This is a test-environment data gap (no active subscription for the test account) rather than a code bug.

---

## 3️⃣ Coverage & Matching Metrics

- **40.00%** of tests passed (6 of 15)

| Requirement                | Total Tests | ✅ Passed | ❌ Failed |
|----------------------------|-------------|-----------|-----------|
| Discover Feed              | 3           | 3         | 0         |
| Explore Grid               | 3           | 2         | 1         |
| Recipe Detail              | 4           | 1         | 3         |
| Paywall / Subscription     | 4           | 0         | 4         |
| Recipe Cooking Steps       | 1           | 0         | 1         |
| **Total**                  | **15**      | **6**     | **9**     |

---

## 4️⃣ Key Gaps / Risks

**40% of tests passed fully.**

### Critical Issues
1. **Auth page renders blank (TC021)** — Convex's `<AuthLoading>` wrapper can block the auth form from ever appearing in slow/CI environments. Consider adding a timeout fallback or rendering the form regardless of auth loading state.

### High-Priority Bugs
2. **"View Recipe" button in Explore bottom sheet not interactable (TC010)** — The button inside `.explore-modal-card` is not responding to clicks. Likely caused by a `pointer-events: none` rule on a parent element or a z-index stacking issue. Needs a fix in `Explore.tsx` / `Explore.css`.

3. **Subscribed user still sees paywall lock in IngredientsModal (TC013)** — The subscription status check in `IngredientsModal` is not correctly recognising an active subscription. The conditional that hides/shows the lock notice needs to be audited.

4. **"Subscribe to see all ingredients" link not clickable (TC014)** — The `<Link>` inside `IngredientsModal` that navigates to the paywall is not interactable. Likely a `pointer-events: none` or z-index issue on a containing element.

5. **Paywall pricing not displayed (TC020, TC022)** — The Paywall page requires a chef to have completed Polar product setup. In the test environment this has not been done, so no subscription options are shown and the subscribe button is absent.

6. **No error/retry UI on failed payment (TC025)** — When a subscription checkout fails, the app silently navigates to `/profile`. A user-visible error message and retry option must be added to the Paywall error handling path.

### Medium-Priority / Test Environment Gaps
7. **No seeded recipe data for test users (TC015, TC028)** — The test database user accounts have no recipes seeded. Run `npx convex run seed:seedRecipes` while authenticated to populate test data and unblock TC015 and TC028.

8. **Paywall redirects to subscription for unsubscribed test user (TC028)** — Correct app behaviour, but tests requiring cooking steps need a pre-subscribed account. Consider seeding a test user with an active subscription.

### Recommendations
- Seed test data (recipes + an active subscription) into the Convex dev environment before running TestSprite.
- Investigate `pointer-events` and z-index layers in the Explore bottom sheet and IngredientsModal overlay.
- Add Convex auth loading timeout / fallback rendering on the Auth page.
- Add error UI to the Paywall subscription flow for failed payment states.
