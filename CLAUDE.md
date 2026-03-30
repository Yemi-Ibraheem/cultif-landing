# CLAUDE.md - Project Intelligence & Learnings

## Project Overview
Cultif is a recipe discovery and cooking app built with React + Vite + Convex (backend/database) + Convex Auth.

## Tech Stack
- **Frontend**: React 18, TypeScript, React Router v6, Vite
- **Backend/DB**: Convex (queries, mutations, file storage)
- **Auth**: @convex-dev/auth
- **Payments**: Stripe (subscriptions, embedded checkout via Stripe Elements)
- **Styling**: Plain CSS (no CSS framework)
- **Video Hosting Direction**: Cloudflare Stream is the active platform for video upload, storage, playback, and live/on-demand streaming.

## Architecture
- Routes defined in `src/App.tsx` using React Router
- Convex functions live in `convex/` (schema.ts, recipes.ts, subscriptions.ts, stripe.ts, stripeServer.ts, stripeWebhook.ts, seed.ts, mealPlans.ts)
- Pages in `src/pages/`, components in `src/components/`

## Current Migration Note
- As of March 26, 2026, video hosting uses Cloudflare Stream.
- Cloudflare Stream docs: https://developers.cloudflare.com/stream/
- Cloudflare Stream areas currently present in the repo include `.env`, `.env.example`, `convex/cloudflareVideo.ts`, `convex/videos.ts`, `convex/schema.ts`, and the recipe upload/player flows.
- For future video work, prefer Cloudflare Stream concepts: direct creator uploads, signed playback when needed, Stream Player or HLS playback, webhooks for processing state, and Cloudflare-native auth/secrets handling.

## Routes (all authenticated)
- `/discover` — Home feed (FeaturedRecipeCard list)
- `/explore` — Instagram-style image grid with popup overlay
- `/create` — Recipe creation wizard (8 steps)
- `/recipe/:id` — Recipe detail
- `/recipe/:id/paywall` — Subscription gate
- `/recipe/:id/cook` — Step-by-step cooking
- `/recipe/:id/complete` — Completion screen
- `/countries` — All countries browser
- `/chef/:id` — Chef profile
- `/plans` — Meal plans list
- `/plans/create` — Create/edit meal plan
- `/profile` — Profile menu
- `/profile/share` — Share page

## Recipe Creation Wizard Flow (8 steps)
1. **Basics** — Upload cover image, title, description
2. **Ingredients** — Add ingredients with amounts/units
3. **Country** — Select recipe's country of origin
4. **Time** — Set prep time and cook time
5. **Goal** — Select weight goals (Build muscle, Lose weight, etc.)
6. **Day** — Select meal type (Breakfast, Lunch, Dinner, Snack)
7. **Dietary** — Select dietary tags (Halal, Vegan, Vegetarian, Kosher)
8. **Video** — Upload video with timeline-based segment editor
9. **Rules of Upload** — Agree to content guidelines
10. **Upload Progress** — Shows progress, success, or error state

After completion: view created recipe or upload another.

## Recipe Viewing Flow
Discover (home) → RecipeDetail → Paywall (if not subscribed) → RecipeSteps → RecipeComplete

## Key Learnings & Fixes

### 1. ImageWithFallback: stale state from props
**Problem**: `useState(src)` only sets the initial value. When the `src` prop changes (e.g. after a Convex query resolves), the internal `imgSrc` state stays stale and the image never updates.
**Fix**: Add a `useEffect` that syncs `imgSrc` whenever `src` changes:
```tsx
useEffect(() => {
  setImgSrc(src);
  setHasError(false);
}, [src]);
```
**Rule**: Any component that copies a prop into state MUST have a `useEffect` to sync it.

### 2. Convex storage ID vs HTTP URL resolution
**Problem**: Pages like RecipeDetail and RecipeSteps were passing HTTP URLs (e.g. Unsplash links) to `getStorageUrl` as if they were Convex storage IDs. This causes Convex validation errors since the string isn't a valid `Id<"_storage">`.
**Fix**: Always guard storage resolution with an `isStorageId` check:
```tsx
const isStorageId = recipe && recipe.imageUrl
  && !recipe.imageUrl.startsWith('http')
  && !recipe.imageUrl.startsWith('/')
  && !recipe.imageUrl.startsWith('data:')
  && recipe.imageUrl !== 'placeholder';
```
FeaturedRecipeCard and CountryRecipeCard already had this check. RecipeDetail and RecipeSteps did not — now they do.
**Rule**: Every call to `getStorageUrl` must check that the URL is actually a storage ID first. Copy the pattern from FeaturedRecipeCard.

### 3. Fallback images must actually exist
**Problem**: `ImageWithFallback` used `/placeholder-food.jpg` as the error fallback, but that file didn't exist in the project. So when an image failed, the fallback also failed.
**Fix**: Use an inline SVG data URI as the fallback so it always works without depending on any file.
**Rule**: Never reference static assets that don't exist in `public/`. Use data URIs for guaranteed fallbacks.

### 4. Mock data with fake IDs breaks navigation
**Problem**: The Discover page used `MOCK_FEED` with IDs like `'mock-1' as any`. Clicking these cards navigated to `/recipe/mock-1`, but RecipeDetail queries Convex with that ID and gets `null` → "Recipe not found".
**Fix**: Replace mock feed with real Convex recipe data (`useQuery(api.recipes.getAllRecipes)`). Seed the database with `npx convex run seed:seedRecipes` to populate real recipes.
**Rule**: Never use fake/mock IDs that pretend to be Convex document IDs. Either use real Convex data or don't make the items clickable.

### 6. User/chef avatar storage IDs must be resolved everywhere they are rendered
**Problem**: After a user uploads a profile picture, `user.avatar` / `recipe.chef.avatar` is set to a Convex storage ID, not an HTTP URL. Any component that renders an avatar — ProfileMenu, FeaturedRecipeCard, ChefProfile, Paywall — must resolve it before use. Fixing only one component leaves the others broken.
**Fix**: Apply the `isStorageId` guard + `useQuery(api.recipes.getStorageUrl)` pattern in every component that renders an avatar:
```tsx
const avatarRaw = someUser?.avatar || someUser?.image || '';
const isAvatarStorageId = avatarRaw && !avatarRaw.startsWith('http') && !avatarRaw.startsWith('/') && !avatarRaw.startsWith('data:') && avatarRaw !== 'placeholder';
const avatarStorageUrl = useQuery(
  api.recipes.getStorageUrl,
  isAvatarStorageId ? { storageId: avatarRaw as Id<"_storage"> } : "skip"
);
const avatarSrc = isAvatarStorageId ? (avatarStorageUrl || avatarFallback) : (avatarRaw || avatarFallback);
```
**Affected components**: ProfileMenu, FeaturedRecipeCard (chef overlay), ChefProfile, Paywall.
**Rule**: Any field that may contain a Convex storage ID must be resolved through `getStorageUrl` before use as an image `src`. Search the whole codebase for new avatar render sites when this pattern needs to be applied.

### 7. useQuery hooks must be called before early returns
**Problem**: Paywall (and similar pages) had early `return` statements for loading/null states before conditional `useQuery` calls. Placing a hook after a conditional return violates React's Rules of Hooks and causes a runtime error.
**Fix**: Always hoist ALL `useQuery` / `useMutation` / `useState` calls to the top of the component, before any early returns. Use the `"skip"` argument to conditionally disable a query rather than putting it inside a conditional block:
```tsx
// WRONG — hook after early return
if (data === null) return <NotFound />;
const url = useQuery(api.foo.bar, data ? { id: data.id } : "skip"); // ❌

// CORRECT — hook before early return, disabled via "skip"
const url = useQuery(api.foo.bar, data ? { id: data.id } : "skip"); // ✅
if (data === null) return <NotFound />;
```
**Rule**: All hooks must appear unconditionally at the top of a component. Never place a hook after an early return or inside an `if` block.

### 8. Instagram-style mixed grid: use a subcomponent per cell + JS pattern for tall items
**Context**: The Explore page needs a 3-column grid with mixed square/tall cells (like Instagram Explore). Two problems arise:
1. CSS `nth-child` alone can't reliably alternate which column a tall item lands in.
2. Each grid cell needs its own `useQuery` calls for image and chef avatar storage IDs — hooks can't be called inside a `.map()` loop.

**Fix**: Create a dedicated `ExploreGridCell` sub-component so each cell manages its own hooks. Compute `isTall` in the parent map using a JavaScript modulo pattern, then pass it as a prop:
```tsx
// In parent map:
const isTall = index % 9 === 2 || index % 9 === 5;
<ExploreGridCell isTall={isTall} ... />

// Cell component applies class:
<div className={`explore-grid-cell${isTall ? ' explore-grid-cell--tall' : ''}`}>
```

**CSS grid setup** (in Explore.css):
```css
.explore-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: calc((100vw - 8px) / 3); /* square rows */
  gap: 2px;
  grid-auto-flow: dense; /* fills gaps left by tall items */
}
.explore-grid-cell--tall { grid-row: span 2; }
```

**How the pattern works** — with `grid-auto-flow: dense`, positions 2 and 5 in each 9-item cycle naturally land in alternating columns (col 3 then col 1), producing the Instagram alternating-tall-column effect:
```
[■][■][▮]   ← tall right (index % 9 === 2)
[■][■][▮]
[▮][■][■]   ← tall left  (index % 9 === 5)
[▮][■][■]
```
**Rule**: For any grid where cells need per-item Convex queries, always extract a sub-component. Never call hooks inside a map. Use JS modulo for layout patterns instead of nth-child when column placement needs to be predictable.

### 9. Popup overlay pattern (bottom sheet)
**Context**: Tapping a grid cell on Explore should show a recipe preview without navigating away.
**Pattern**: Keep a `selectedRecipe` state in the page. Render the backdrop + card inline (not a separate route). Hoist the selected recipe's storage URL query before any early returns (Rule 7). Use `e.stopPropagation()` on the card so only backdrop clicks close it:
```tsx
const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(null);
// Hoisted storage query (skipped when null):
const selStorageUrl = useQuery(api.recipes.getStorageUrl, selIsStorageId ? { storageId: ... } : "skip");

// In JSX:
{selectedRecipe && (
  <div className="explore-modal-backdrop" onClick={() => setSelectedRecipe(null)}>
    <div className="explore-modal-card" onClick={e => e.stopPropagation()}>
      {/* content */}
    </div>
  </div>
)}
```
**CSS**: `position: fixed; inset: 0` backdrop, `align-items: flex-end` to anchor card at bottom, `border-radius: 16px 16px 0 0` on card, `animation: slideUp` for feel.
**Rule**: Prefer inline state-driven overlays over route-based navigation for quick previews. Always hoist the overlay's queries unconditionally.

### 10. CategoryStatusScroller "Create meal plan" entry point
**Context**: The home feed (`Discover`) shows a horizontal category scroller (`CategoryStatusScroller`) that ends with a "Create meal plan" bubble. It had no `onClick` handler so tapping it did nothing.
**Fix**: Import `useNavigate` and call `navigate('/plans/create')` on that item's `onClick`. The route was already registered in `App.tsx`.
**Rule**: Every tappable entry-point in the scroller must be wired to its destination route. When adding new journey entry points, check `CategoryStatusScroller` and confirm the target route exists in `App.tsx` before assuming navigation works.

### 11. Clickable elements inside modals/overlays: use `<Link>`, not `onClick` + `navigate`
**Problem**: The "Subscribe to see all ingredients" notice in `IngredientsModal` was a plain `<div>` with no click handler. Multiple attempts to make it work using `<button onClick={() => navigate(...)}>` inside a `position: absolute` overlay on RecipeDetail failed repeatedly due to `pointer-events: none`, z-index stacking, and event propagation issues.
**Root cause**: The actual clickable element the user was tapping lived inside `IngredientsModal` (the popup), NOT the overlay on RecipeDetail. Always identify WHICH component renders the element the user is describing before attempting a fix.
**Fix**:
1. Identify the correct component — the `IngredientsModal` popup, not the RecipeDetail page overlay.
2. Use React Router `<Link to={...}>` instead of `<button onClick={navigate(...)}>` for navigation actions. `<Link>` renders a native `<a>` tag that handles clicks at the browser level — immune to pointer-events and z-index issues.
3. Pass `recipeId` as a prop to modal components that need to link to subscription/paywall routes.
```tsx
// IngredientsModal.tsx
<Link className="ingredients-modal-lock-notice" to={`/recipe/${recipeId}/paywall`}>
  <span>🔒</span>
  <span>Subscribe to see all ingredients</span>
</Link>
```
**Rule**: When a user reports "this button doesn't work", always ask or verify WHICH screen/component they're looking at (page vs modal vs overlay). For navigation actions inside modals, always use `<Link>` over `onClick` + `navigate()`. Add `text-decoration: none; color: inherit;` to keep the link styled like a button.

### 5. Seed data must be comprehensive
**Problem**: Original seed had only 3 ingredients and 3-4 instructions per recipe, which made the detail page look empty and the cooking steps page too short.
**Fix**: Each seeded recipe now has 6-10 ingredients and 5-7 instructions. The seed also deletes existing recipes before re-inserting so it can be re-run cleanly.
**Rule**: Seed data should populate ALL fields the UI displays. Check what each page reads before writing seed data.

### 12. Timeline-based video editor: derive segments from markers, not direct state
**Context**: The recipe creation wizard's video step (step 7) allows chefs to split a video into parts by clicking a timeline to place markers. Each part has title, notes, and ingredient selections.

**Problem**: The initial approach stored segments directly in state with manual duration strings. This was clunky and didn't match the UX of clicking a timeline to mark split points.

**Solution**: Use a marker-based approach where:
1. **Markers** (`number[]`) are the source of truth — timestamps (in seconds) where splits occur
2. **Segments** are **derived** from markers via `useMemo` using a `deriveSegments()` function
3. The video file itself is uploaded once; segments are just metadata (startTime/endTime)

**Architecture**:
```tsx
const [markers, setMarkers] = useState<number[]>([]);
const [videoDuration, setVideoDuration] = useState<number>(0);

const segments = useMemo(
  () => deriveSegments(markers, videoDuration, videoParts),
  [markers, videoDuration, videoParts]
);

function deriveSegments(markers: number[], duration: number, existingParts: VideoPart[]) {
  const boundaries = [0, ...markers.sort((a, b) => a - b), duration];
  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    // Preserve existing data (title, notes, ingredients) if segment already exists
    const existing = existingParts.find(p =>
      Math.abs(p.startTime - start) < 0.5 && Math.abs(p.endTime - end) < 0.5
    );
    return existing || { name: '', notes: '', startTime: start, endTime: end, ingredients: [] };
  });
}
```

**Key techniques**:
- **Timeline click handler**: Convert click position to timestamp via `(clickX / timelineWidth) * videoDuration`
- **Validation**: Markers can't be < 1s from edges or < 2s from other markers
- **Playback indicator**: Track `video.currentTime` with `onTimeUpdate` and render a teal line at that position
- **Data preservation**: When adding/removing markers, preserve existing segment data (title, notes) by matching time ranges
- **Single video + metadata**: Store one video file with an array of `{ startTime, endTime, name, notes, ingredients }` objects in the database

**Schema change**:
```ts
// OLD (manual)
videoParts: v.array(v.object({
  duration: v.string(),  // e.g. "2:30"
  ...
}))

// NEW (timestamp-based)
videoParts: v.array(v.object({
  startTime: v.number(),  // seconds
  endTime: v.number(),    // seconds
  ...
}))
```

**UI Components**:
- **Timeline track**: Clickable div with gray gradient background, 56px height
- **Marker pins**: Red vertical lines (`#ff6b6b`) positioned absolutely at `(markerTime / duration) * 100%`
- **Playback progress**: Teal line (`#20b2aa`) with circular handle, tracks current video position
- **Segment visualization**: Colored regions below timeline showing part boundaries
- **Segment cards**: Auto-generated from segments array, each shows time range + editable fields

**Interaction flow**:
1. Chef uploads video → `onLoadedMetadata` captures duration
2. Chef clicks timeline → marker added at that timestamp
3. Segments auto-derive from `[0, marker1, marker2, ..., duration]`
4. Chef fills in title/notes for each segment
5. Chef clicks `×` on a segment → removes that end marker, adjacent segments merge
6. On submit, `videoParts` array is sent with startTime/endTime for each segment

**Files**: `src/components/create/StepVideo.tsx` (component logic), `StepVideo.css` (timeline styles), `convex/schema.ts` (videoParts field).

**Rule**: For timeline-based editors, store markers as source of truth and derive segments. Don't store segments directly — they should be computed. Always preserve user data (text inputs) when markers change by matching time ranges. Use `useMemo` to avoid recalculating segments on every render.

### 13. Country tags must always show a flag, never an abbreviation
**Rule**: Whenever a country tag/badge/chip component is rendered, it must display the corresponding flag SVG from `src/assets/flags/Mini flags/` next to the country name. Never use a country abbreviation (e.g. "NG", "US", "FR") as a substitute for the flag. The flag image is always required.
**Pattern**:
```tsx
import NigeriaFlag from '../assets/flags/Mini flags/Nigeria.svg';

<span className="country-tag">
  <img src={NigeriaFlag} alt="" className="country-tag-flag" />
  Nigeria
</span>
```
**Available flags**: Ghana, China, Morroco, France, Nigeria, Malaysia, Senegal, Spain, Germany, Colombia, Brazil, America, England, Ivory coast, Italy, Jamaica, Japan, Mexico, Argentina.
**If a country has no flag SVG**: Fall back to the country name only — still never use an abbreviation.

### 14. Dietary icons must show only the icon, never the title text
**Context**: The SVGs in `src/assets/Dietaryicons/` (e.g. `Halal (1).svg`) contain both a graphical icon and the dietary word rendered as SVG path text below it. When displaying dietary tags in the app, only the icon portion should be visible — the title text baked into the SVG must be hidden.
**Rule**: When rendering a dietary tag/badge/chip, use only the icon from `src/assets/Dietaryicons/` and hide or crop out the built-in text label. Display the dietary name as a separate text element in HTML if a label is needed, so it can be styled independently.
**Pattern** — hide the SVG's text via CSS:
```css
.dietary-icon svg text,
.dietary-icon svg > path:last-child {
  display: none;
}
```
Or use a wrapper with `overflow: hidden` and a fixed height that crops the text portion:
```css
.dietary-icon {
  width: 24px;
  height: 24px;
  overflow: hidden;
}
.dietary-icon img {
  width: 24px;
  height: auto;
  object-fit: cover;
  object-position: top;
}
```
**Available dietary icons**: `Halal (1).svg`, `Vegan.svg`, `Vegetarian.svg`, `Protein.svg`, `Weight gain.svg`, `Bulk.svg`, `Fatty.svg`.
**Rule**: Never rely on the SVG's built-in text to label a dietary tag. Always pair the icon with a separate HTML text element if a label is needed.

### 15. Back buttons must always use `navigate(-1)`
**Rule**: Every back button in the app must use `navigate(-1)` from React Router's `useNavigate()`. Never hardcode a specific route (e.g. `navigate('/profile')`) for a back button — this breaks the expected UX when the user arrived from a different page.
**Pattern**:
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<button type="button" onClick={() => navigate(-1)} aria-label="Back">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
</button>
```
**Applies to**: All pages and modals with a back/close chevron in the header — ProfileSettings, PrivacyPolicy, TermsOfService, CommunityGuidelines, ProfileHelp, and any future pages with a header back button.
**Exception**: Wizard steps (e.g. CreateRecipe) where "back" means "go to previous step" — these should call the wizard's internal `prevStep()` function, not `navigate(-1)`.

### 16. Logo contrast: use dark logo on light backgrounds, white logo on dark backgrounds
**Rule**: When displaying the Cultif logo, always choose the variant that contrasts with the background:
- **Light background** → use `src/assets/Logo/Black.png` (or `Small black.png` / `Branding logo black.png` for smaller/branded variants)
- **Dark background** → use `src/assets/Logo/White.png` (or `Small white.png` / `Branding logo white.png`)
**Never** use a white logo on a light background or a dark logo on a dark background. Import the logo as a module rather than using a raw path string:
```tsx
import cultifLogoBlack from '../assets/Logo/Black.png';
<img src={cultifLogoBlack} alt="Cultif" />
```
**Available logo files**: `Black.png`, `White.png`, `Small black.png`, `Small white.png`, `Branding logo black.png`, `Branding logo white.png`, `favicon.ico.png`.

### 17. User queries must never expose email or PII to other users
**Problem**: The `getUser` query had no authentication and returned the entire user document — including `email`, `phone`, `preferences`, and Stripe product IDs — for ANY user by ID. Anyone could call `POST /api/query` and harvest user emails.
**Fix**: Two-layer approach:
1. **`currentUser`** — strips `email`, `phone`, `phoneVerificationTime`, `emailVerificationTime` via destructuring. Returns only public fields. Used by most of the app (nav, profile display, auth checks).
2. **`getMyPrivateProfile`** — returns the caller's OWN full document (including email/phone). Used only by pages that need sensitive fields: `Paywall.tsx` (payment email), `ProfileSettings.tsx` (display/edit email), `ProfileMenu.tsx` (account switcher), `SharePage.tsx` (username derivation).
3. **`getUser`** (fetch another user by ID) — requires authentication and returns only: `_id`, `_creationTime`, `name`, `avatar`, `image`, `bio`, `username`, `isChef`, `chefProfile`, `createdAt`. Never returns email, phone, preferences, or Stripe fields.
**Rule**: Every Convex query that returns user data must follow this principle:
- **Own data** → use `getMyPrivateProfile` (auth required, full document)
- **Other user's data** → use `getUser` (auth required, public fields only)
- **Never** return `email`, `phone`, or other PII in queries that can return another user's data
- When adding new queries that touch the `users` table, always whitelist returned fields explicitly — never return `ctx.db.get(userId)` directly to the client for non-self queries.

### 19. Stripe payment integration (chef monetisation)
**Architecture**: Platform model — Cultif's single Stripe account handles all payments. Payouts to chefs handled outside Stripe.
**Flow — Chef setup** (ProfileMenu):
1. Chef enters monthly/annual prices → `startStripeProductSetup` (mutation) inserts a `stripeProductRequests` row
2. `createStripeProduct` (action) calls Stripe API: creates a Product + two Prices (monthly, annual)
3. `completeStripeProductSetup` stores `stripeProductId`, `stripePriceIdMonthly`, `stripePriceIdAnnual` on the user doc
4. Price updates: `updateStripePrices` archives old Prices, creates new ones on the same Product

**Flow — User subscribes** (Paywall):
1. User picks a plan (monthly/annual) and clicks Continue
2. `createSubscription` (action) creates/finds a Stripe Customer (keyed by `convexUserId` metadata), creates a Subscription with `payment_behavior: 'default_incomplete'`
3. Returns `clientSecret` from the PaymentIntent on the latest invoice
4. Frontend renders `<Elements>` + `<PaymentElement>` with the `clientSecret`
5. User fills in card → `stripe.confirmPayment()` → redirect to success URL
6. Stripe webhook `invoice.paid` fires → `setSubscriptionFromWebhook` activates the subscription in Convex

**Webhook events handled** (`POST /stripe/webhook`):
- `invoice.paid` → activate/renew subscription
- `customer.subscription.updated` → update status/period
- `customer.subscription.deleted` → revoke subscription

**Schema fields**:
- `users`: `stripeProductId`, `stripePriceIdMonthly`, `stripePriceIdAnnual`, `monthlyPrice`, `annualPrice`
- `subscriptions`: `stripeSubscriptionId`, `stripeCustomerId`, `status`, `currentPeriodEnd`
- `stripeProductRequests`: temporary table for product setup requests

**Environment variables** (Convex dashboard): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
**Frontend env** (`.env`): `VITE_STRIPE_PUBLISHABLE_KEY`
**NPM packages**: `stripe` (backend), `@stripe/stripe-js` + `@stripe/react-stripe-js` (frontend)
**Files**: `convex/stripe.ts`, `convex/stripeServer.ts`, `convex/stripeWebhook.ts`, `convex/http.ts`, `src/pages/Paywall.tsx`, `src/pages/ProfileMenu.tsx`
**Rule**: Never expose `STRIPE_SECRET_KEY` to the frontend. All Stripe API calls must go through Convex actions (`"use node"`). The publishable key (`pk_...`) is safe for the frontend.

### 18. Email verification required on signup (anti-bot)
**Problem**: Anyone could create accounts instantly with no verification, making the app vulnerable to bot signups.
**Fix**: Require email verification via OTP before an account is activated. Uses Resend as the email provider.
**Architecture**:
- `convex/ResendOTP.ts` — Configures the `@auth/core` Resend provider to generate 8-digit numeric OTP codes and send them via the Resend API with a branded HTML email.
- `convex/auth.ts` — `Password({ verify: ResendOTP })` — the `verify` option tells Convex Auth to require email verification before authenticating.
- `src/pages/Auth.tsx` — After signup or signin, the frontend transitions to an OTP input step. The user enters the code sent to their email. `flow: "email-verification"` completes verification and authenticates the user.

**Flow**:
1. User submits signup form → `signIn("password", { email, password, name, flow: "signUp" })` → account created but NOT authenticated
2. Convex Auth sends 8-digit OTP to the user's email via Resend
3. Frontend shows OTP input → user enters code → `signIn("password", { email, code, flow: "email-verification" })`
4. Backend verifies OTP → sets `emailVerificationTime` on user → authenticates → redirects to onboarding

**For signin**: If email is already verified, signin completes immediately (no OTP). If not verified (edge case), OTP is sent and required.

**Resend code**: 60-second cooldown, then user can tap "Resend code" to trigger a new OTP.

**Environment variables** (set in Convex dashboard):
- `AUTH_RESEND_KEY` — Resend API key (required)
- `AUTH_EMAIL_FROM` — Sender address (optional, defaults to `Cultif <noreply@cultif.com>`). Must be a verified domain in Resend.

**Dependencies**: `resend`, `@oslojs/crypto` (for OTP generation).
**Files**: `convex/ResendOTP.ts`, `convex/auth.ts`, `src/pages/Auth.tsx`, `src/pages/Auth.css`.
**Rule**: Never remove the `verify` option from the Password provider. All accounts must go through email verification.

### 19. Rate limiting on authentication (brute-force protection)
**Problem**: No rate limiting on login, OTP verification, or OTP resend. An attacker could attempt 1000+ passwords per minute or brute-force 8-digit OTP codes.
**Fix**: Server-side rate limiting using Convex DB (`authRateLimits` table) with frontend enforcement.
**Architecture**:
- `convex/rateLimit.ts` — Three mutations: `checkRateLimit` (pre-flight check + increment), `recordFailure` (record after a failed attempt), `clearRateLimit` (reset on success).
- `convex/schema.ts` — `authRateLimits` table tracks attempts per `key` (e.g. `"password:user@email.com"`), with `windowStart`, `attempts`, and `lockedUntil` fields.
- `src/pages/Auth.tsx` — Calls `checkRateLimit` before every `signIn` call. On failure, calls `recordFailure`. On success, calls `clearRateLimit`.

**Rate limits**:
| Action | Max attempts | Window | Lockout |
|---|---|---|---|
| Password sign-in/sign-up | 5 | 15 min | 15 min |
| OTP verification | 5 | 15 min | 15 min |
| OTP resend | 3 | 15 min | 15 min |

**Limitations**: Rate limiting is enforced at the frontend layer. A determined attacker could bypass the frontend and call Convex Auth's `signIn` action directly (the library doesn't expose middleware hooks). The existing OTP requirement provides defence-in-depth — even a correct password is useless without the email code.
**Rule**: Never remove the rate limit checks from `Auth.tsx`. When adding new auth entry points (e.g. social login, phone auth), add corresponding rate limit checks. The `authRateLimits` table rows are ephemeral — old rows can be cleaned up periodically.

### 20. Cloudflare Turnstile (bot protection)
**Problem**: Bots can create accounts, spam forms, and scrape data even with rate limiting — rate limits alone don't distinguish humans from bots.
**Fix**: Cloudflare Turnstile widget on the sign-in/sign-up form. Turnstile is free, privacy-friendly, and invisible for most legitimate users (no puzzle solving). The token is verified server-side via a Convex action before auth proceeds.
**Architecture**:
- `@marsidev/react-turnstile` — React wrapper for the Turnstile widget
- `convex/turnstile.ts` — `"use node"` action that calls Cloudflare's `siteverify` API with the secret key
- `src/pages/Auth.tsx` — Renders `<Turnstile>` widget between form fields and submit button; submit is disabled until Turnstile completes; token verified server-side before `signIn`

**Flow**:
1. User loads sign-in/sign-up form → Turnstile widget renders (managed mode — invisible for most users)
2. Turnstile runs browser challenges in background → `onSuccess` callback stores token in state
3. User submits form → `verifyTurnstile({ token })` calls Cloudflare's siteverify endpoint
4. If valid → proceed with rate limit check → `signIn`
5. If invalid → show error, reset widget, block submission

**Key details**:
- Submit button is `disabled` until `turnstileToken` is set (Turnstile passed)
- Token is reset on failure, when switching between sign-in/sign-up, and on token expiry
- `size: 'flexible'` makes the widget responsive to container width
- Turnstile is NOT on the OTP verification step (bot already passed challenge to reach that point)

**Environment variables**:
- Convex dashboard: `TURNSTILE_SECRET_KEY` (the secret key from Cloudflare dashboard)
- Frontend `.env`: `VITE_TURNSTILE_SITE_KEY` (the site key from Cloudflare dashboard)

**Setup**: Create a Turnstile widget at https://dash.cloudflare.com → Turnstile → Add site. Choose "Managed" mode. Copy the site key to `.env` and the secret key to the Convex dashboard.

**Dependencies**: `@marsidev/react-turnstile`
**Files**: `convex/turnstile.ts`, `src/pages/Auth.tsx`
**Rule**: Never remove the Turnstile check from `Auth.tsx`. The submit button must stay disabled until Turnstile passes. Always verify the token server-side — never trust the frontend alone. When adding new public-facing forms (e.g. contact, feedback), add Turnstile there too.

### 21. Checkout redirect URL validation (redirect-injection prevention)
**Problem**: The `return_url` passed to `stripe.confirmPayment()` was built entirely on the client using `window.location.origin` + an unsanitized `recipeId` from URL params. An attacker could craft a URL with a manipulated recipe ID or, on a proxied/spoofed origin, redirect users to a malicious site after payment.
**Fix**: A `buildPaymentReturnUrl(recipeId)` utility in `src/utils/validateRedirectUrl.ts` that:
1. Validates `recipeId` matches a strict alphanumeric pattern (`/^[a-zA-Z0-9_-]+$/`) — rejects path traversal, encoded chars, etc.
2. Checks `window.location.origin` against an allowlist of trusted origins (`VITE_SITE_URL`, `cultif.com`, and `localhost` in dev mode only).
3. URL-encodes the `recipeId` in the path as defense-in-depth.
If either check fails, the payment form shows an error and aborts — the redirect URL is never sent to Stripe.
**Environment variable**: `VITE_SITE_URL` — set to the canonical production URL (e.g. `https://cultif.com`). Added to `.env.example`.
**Files**: `src/utils/validateRedirectUrl.ts`, `src/pages/Paywall.tsx`
**Rule**: Never construct redirect URLs by string-concatenating user-controlled values (URL params, query strings, form inputs). Always use `buildPaymentReturnUrl` or `isAllowedRedirectUrl` from `src/utils/validateRedirectUrl.ts`. When adding new payment flows or any post-action redirects, validate the target URL against the allowlist before use.

### 22. Forgot password / password reset flow
**Context**: Users who forget their password need a way to reset it without contacting support.
**Architecture**: Uses the Convex Auth Password provider's built-in `reset` option alongside the existing `verify` option. A separate Resend email provider (`ResendOTPPasswordReset`) sends branded reset OTP emails.
**Flow**:
1. User clicks "Forgot password?" link on the sign-in form
2. `forgotPassword` step: User enters email → Turnstile check → rate limit check → `signIn("password", { email, flow: "reset" })` → sends 8-digit OTP to email
3. `resetCode` step: User enters OTP code + new password + confirm password → `signIn("password", { email, code, newPassword, flow: "reset-verification" })`
4. On success, the user is automatically signed in (Convex Auth creates a session after reset-verification)

**Key details**:
- `flow: "reset"` sends the reset code; `flow: "reset-verification"` verifies code and sets new password
- The `reset-verification` flow requires `newPassword` (NOT `password`) — this is a Convex Auth convention
- Turnstile is required on the `forgotPassword` step (bot protection) but NOT on `resetCode` (user already passed challenge)
- Rate limiting: `reset` type (3 attempts / 15 min) for sending codes, reuses `otp` type for verification, reuses `resend` type for re-sending codes
- Client-side password validation: min 6 chars, confirm must match

**Files**: `convex/ResendOTPPasswordReset.ts` (email provider), `convex/auth.ts` (Password config), `convex/rateLimit.ts` (reset rate limit), `src/pages/Auth.tsx` (UI), `src/pages/Auth.css` (styles)
**Rule**: Never remove the `reset` option from the Password provider. The `forgotPassword` step must always include Turnstile. Always use `newPassword` (not `password`) in the `reset-verification` flow — using `password` will silently fail.

### 23. Google and Apple OAuth providers
**Context**: Users can sign in/up with Google or Apple in addition to email+password.
**Architecture**:
- `convex/auth.ts` — `Google` and `Apple` imported from `@auth/core/providers/google` and `@auth/core/providers/apple`, added to the `providers` array alongside `Password`.
- Convex Auth auto-links accounts by email — if a user signs up with Google and later signs in with password (or vice versa), the same user record is used.
- OAuth callback routes are registered automatically by `auth.addHttpRoutes(http)` in `convex/http.ts`.

**Frontend**: `signIn("google")` and `signIn("apple")` from `useAuthActions()`. These redirect the user to the provider's consent screen, then back to the app.

**Environment variables** (Convex dashboard):
- `AUTH_GOOGLE_ID` — Google OAuth client ID
- `AUTH_GOOGLE_SECRET` — Google OAuth client secret
- `AUTH_APPLE_ID` — Apple Service ID
- `AUTH_APPLE_SECRET` — Apple signed JWT (must regenerate every 6 months)
- `SITE_URL` — Frontend URL (needed for OAuth redirect-back and magic link URLs)

**Google Cloud setup**: Create OAuth client → set redirect URI to `https://<deployment>.convex.site/api/auth/callback/google`.
**Apple Developer setup**: Create App ID + Service ID + Key → set return URL to `https://<deployment>.convex.site/api/auth/callback/apple`. Apple does NOT support localhost testing.

**Files**: `convex/auth.ts`, `src/pages/Auth.tsx`, `src/pages/Auth.css`
**Rule**: Never remove the Google or Apple providers from `convex/auth.ts`. When adding new OAuth providers, import from `@auth/core/providers/<provider>` and add to the `providers` array. The provider ID used in `signIn()` is the lowercase provider name.

### 24. Magic link email verification (replaces OTP-only)
**Context**: After signup or unverified signin, instead of only sending an 8-digit OTP code, the verification email now includes a clickable magic link alongside a fallback code.
**Architecture**:
- `convex/ResendOTP.ts` — `sendVerificationRequest` constructs a magic link URL: `${SITE_URL}/auth?code=${token}&email=${encodeURIComponent(email)}`. The email contains a "Verify your email" button (the magic link) plus the code displayed below as a fallback.
- `src/pages/Auth.tsx` — On mount, reads `code` and `email` from URL search params. If both are present, auto-triggers `signIn("password", { email, code, flow: "email-verification" })` and shows a "Verifying..." spinner (`magicLinkVerifying` step). On failure, falls back to the manual code entry UI.
- The verify step UI now says "Click the link in your email to continue" with a toggle to show manual code entry.

**Environment variable**: `SITE_URL` — must be set in Convex dashboard to the frontend URL (e.g. `http://localhost:5173` for dev). Used to construct the magic link.
**Files**: `convex/ResendOTP.ts`, `src/pages/Auth.tsx`, `src/pages/Auth.css`
**Rule**: The `SITE_URL` env var must always be set correctly — magic links will break without it. The password reset flow (`ResendOTPPasswordReset.ts`) intentionally still uses OTP-only since reset requires entering a new password. Never remove the fallback code from the verification email.

### 25. Auto-switch sign-up to sign-in on duplicate email
**Context**: When a user tries to sign up with an email that already has an account, instead of just showing an error, the app auto-switches to the sign-in form with the email pre-filled.
**Implementation**: In `Auth.tsx` `handleSubmit` catch block, when the error matches `already exists|already registered|user.*exist|email.*taken` and the current step is `signUp`, the handler sets `step` to `signIn`, clears the password, and shows an info message: "An account with this email already exists. Please sign in."
**Files**: `src/pages/Auth.tsx`
**Rule**: Always check for the "already exists" error pattern before recording a failure or showing a generic error. The email must be preserved when switching steps.

## Deferred / Hidden Features
- **AI plan creation** (`ChooseMethod` step 0 in CreatePlan): The "Use AI to create your custom plan" button has been hidden and step 0 is skipped (app starts at step 1, `creationMethod` defaults to `'manual'`). The `ChooseMethod` component and `'ai'` option still exist in code — restore by setting `useState(0)` in CreatePlan and removing the `{/* hidden */}` comment in ChooseMethod. Do NOT remove this code.
- **Explore search bar**: The search input on `/explore` is UI-only (no filtering logic). Do not wire it up until explicitly requested.
- **Explore filter chips**: Designs show "Dishes / Weight gain / Lose weight" filter chips on the Explore page — these have been intentionally skipped and are not yet implemented.

## Commands
- `npm run dev` — Start Vite dev server
- `npx convex dev` — Start Convex dev backend
- `npx convex run seed:seedRecipes` — Seed/re-seed sample recipes (requires at least one authenticated user)

## File Conventions
- CSS files are co-located with their components/pages (e.g. `RecipeDetail.css` next to `RecipeDetail.tsx`)
- Flag SVGs live in `src/assets/flags/Mini flags/`
- Dietary icons in `src/assets/Dietaryicons/`
- Dish images in `src/assets/Dishes/`
