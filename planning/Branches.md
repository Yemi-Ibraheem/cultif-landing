# Branch Strategy

## Overview

Three-branch workflow: `main` (production), `pre-prod` (staging), and feature branches.

| Branch | Purpose |
|---|---|
| `main` | Stable production code |
| `pre-prod` | Staging — test here before promoting to production |

---

## Daily Workflow

When working on new features or changes:

```bash
# Switch to pre-prod
git checkout pre-prod

# Make changes, then commit
git add .
git commit -m "description of changes"

# Push pre-prod to remote (first time)
git push -u origin pre-prod

# Subsequent pushes
git push origin pre-prod
```

---

## Promoting to Production

When you're happy with what's on pre-prod:

```bash
# Switch to main
git checkout main

# Merge pre-prod into main
git merge pre-prod

# Push to production
git push origin main
```

---

## Reverting Pre-prod

If you don't like the changes and want to reset pre-prod back to production:

```bash
git checkout pre-prod
git reset --hard origin/main
```

---

## Setup (one-time)

Create the `pre-prod` branch from `main`:

```bash
git checkout main
git branch pre-prod
git push -u origin pre-prod
```
