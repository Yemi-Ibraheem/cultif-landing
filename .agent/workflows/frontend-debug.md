---
description: Debug frontend issues — scans for broken imports, type errors, missing CSS, and runtime errors in the Vite dev server
---

# Frontend Debug Agent

Use this workflow to diagnose and fix frontend bugs in the Cultif app.

## Steps

### 1. Check the Vite dev server for errors
// turbo
Run `cmd /c "npx vite --clearScreen false 2>&1 | head -50"` or check the running Vite terminal output using the `command_status` tool.

Look for:
- `Failed to resolve import` — indicates broken import paths
- `Pre-transform error` — usually a missing file or bad path
- `SyntaxError` — invalid JSX/TSX syntax
- `TypeError` — runtime type issues

### 2. Run TypeScript type checking
// turbo
Run `cmd /c "npx tsc --noEmit"` from the project root.

Look for:
- `Type 'X' is not assignable to type 'Y'` — type mismatch (e.g., `string` vs `Id<"recipes">`)
- `Cannot find module` — missing dependency or broken import
- `Property 'X' does not exist on type 'Y'` — API mismatch between frontend and backend

### 3. Scan for broken import paths
Use `grep_search` tool to find all imports from `convex/_generated/api` in `src/`:
- Files in `src/pages/` should use `../../convex/_generated/api`
- Files in `src/components/` should use `../../convex/_generated/api`
- Files in `src/` (root) should use `../convex/_generated/api`

### 4. Validate component prop types
Check that all component interfaces that reference Convex IDs use `Id<"tableName">` (from `../../convex/_generated/dataModel`) instead of `string`.

Key files to check:
- `src/components/FeaturedRecipeCard.tsx` — `_id` should be `Id<"recipes">`
- `src/components/CountryRecipeCard.tsx` — `_id` should be `Id<"recipes">`
- `src/components/HorizontalRecipeCarousel.tsx` — `_id` should be `Id<"recipes">`

### 5. Check for missing CSS class references
Use `grep_search` to find `className=` references in `.tsx` files and verify that the corresponding CSS classes exist in the associated `.css` files.

### 6. Check auth configuration on frontend
Verify in `src/pages/Auth.tsx`:
- `useAuthActions()` should only destructure `signIn` and `signOut` (not `signUp`)
- Sign-up should use: `signIn("password", { email, password, name, flow: "signUp" })`
- Sign-in should use: `signIn("password", { email, password, flow: "signIn" })`

### 7. Report findings
Summarize all issues found across steps 1-6, categorized as:
- 🔴 **Critical** — app won't load or crash
- 🟡 **Warning** — functionality broken but app loads
- 🟢 **Info** — style/cleanup issues

For each issue, suggest the exact fix with file path and line number.
