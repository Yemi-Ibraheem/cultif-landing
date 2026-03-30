---
description: Debug backend issues — checks Convex dev server, schema validation, auth config, and function correctness
---

# Backend Debug Agent

Use this workflow to diagnose and fix backend bugs in the Cultif Convex backend.

## Steps

### 1. Check if Convex dev server is running
// turbo
Run `cmd /c "npx convex dev --once"` from the project root to sync and check for errors.

Look for:
- `Schema validation failed` — schema mismatch with existing data
- `Could not push` — deployment errors
- `Error in function` — runtime errors in backend functions
- Successful output means the backend is correctly configured

### 2. Validate schema.ts
Read `convex/schema.ts` and check:
- All table definitions use valid `v.*` validators
- Index fields reference actual columns in the table
- Foreign key references (e.g., `v.id("users")`) point to existing tables
- The `...authTables` spread is present and users table extends auth fields correctly

### 3. Check auth provider configuration
Read `convex/auth.ts` and verify:
- At least one provider is configured (e.g., `Password` from `@convex-dev/auth/providers/Password`)
- The `providers: []` array is NOT empty
- All exported functions (`auth`, `signIn`, `signOut`, `store`, `isAuthenticated`) are present

Read `convex/auth.config.ts` and verify:
- `domain` is set to `process.env.CONVEX_SITE_URL`
- `applicationID` is set to `"convex"`

### 4. Validate HTTP routes
Read `convex/http.ts` and verify:
- `auth.addHttpRoutes(http)` is called to register auth endpoints
- The `httpRouter()` is properly exported as default

### 5. Audit query and mutation functions
Read all files in `convex/` (excluding `_generated/` and `seed.ts`):

For each function, check:
- **Auth guards**: Mutations that modify user data should call `getAuthUserId(ctx)` and check for null
- **Error handling**: Functions should throw meaningful errors (not silently failing)
- **Index usage**: Queries using `.withIndex()` should reference indexes defined in `schema.ts`
- **Return types**: Queries should return data consistently (not mixing null/undefined)

Key files:
- `convex/recipes.ts` — recipe CRUD operations
- `convex/users.ts` — user profile operations

### 6. Check environment variables
Read `.env.local` and verify:
- `CONVEX_DEPLOYMENT` is set (e.g., `dev:precious-malamute-434`)
- `VITE_CONVEX_URL` is set and points to a valid `.convex.cloud` URL
- `VITE_CONVEX_SITE_URL` is set and points to a valid `.convex.site` URL

### 7. Verify generated API is up to date
Read `convex/_generated/api.js` and check:
- If it only contains `anyApi`, the Convex dev server needs to be run to generate typed references
- After running `npx convex dev`, it should contain specific function references

### 8. Report findings
Summarize all issues found across steps 1-7, categorized as:
- 🔴 **Critical** — backend won't start or data integrity issue
- 🟡 **Warning** — functionality broken but server runs
- 🟢 **Info** — optimization or best practice suggestions

For each issue, suggest the exact fix with file path and line number.
