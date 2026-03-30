# Cultif — Deployment Guide

> **Stack**: Convex (backend/database/auth) + Vercel (frontend)
> **Last Updated**: March 3, 2026

---

## Overview

This guide walks through deploying the Cultif app to production:

1. **Convex** — Backend, database, auth, and file storage
2. **Vercel** — React frontend hosting

---

## Step 1: Deploy Convex to Production

Right now you're using a Convex dev deployment. You need to create a production deployment.

### 1a. Log in to Convex (if not already)

```bash
npx convex login
```

### 1b. Create a production deployment

```bash
npx convex deploy
```

This will:

- Prompt you to select your existing project (or create one)
- Push all your Convex functions (`convex/` folder) to the **production** deployment
- Give you a production deployment URL like `https://your-project-name.convex.cloud`

### 1c. Set the `CONVEX_SITE_URL` environment variable on the Convex production deployment

Your `convex/auth.config.ts` uses `process.env.CONVEX_SITE_URL`. For Convex Auth to work in production, you need to set this to your final Vercel domain. You can do this via the Convex dashboard or CLI:

```bash
npx convex env set CONVEX_SITE_URL https://your-app.vercel.app --prod
```

Replace `https://your-app.vercel.app` with whatever your actual Vercel domain will be. You can update this later once you know the exact URL.

### 1d. Set the auth signing secret

Convex Auth with Password provider needs a signing secret. Generate one and set it on your production deployment:

```bash
npx @convex-dev/auth generate-secret
```

Then set it:

```bash
npx convex env set AUTH_SECRET <the-generated-secret> --prod
```

(Check the Convex Auth docs for the exact variable name your version expects — it may be `AUTH_SECRET` or `CONVEX_AUTH_PRIVATE_KEY`.)

### 1e. Seed your production database (optional)

If you want sample data in production:

```bash
npx convex run seed:seedRecipes --prod
```

---

## Step 2: Prepare for Vercel

### 2a. Build script

Your current `package.json` build script is:

```json
"build": "tsc -b && vite build"
```

This is fine for Vercel — it just builds the frontend. Convex functions are deployed separately (Step 1), not as part of the Vite build.

### 2b. Note your production Convex URL

After `npx convex deploy`, you'll have a production URL. It looks like:

```
https://your-project-name.convex.cloud
```

You'll set this as an environment variable on Vercel in the next step.

---

## Step 3: Deploy to Vercel

### 3a. Push your code to GitHub (if not already)

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 3b. Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel should auto-detect it as a **Vite** project

### 3c. Configure build settings on Vercel

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` (or `tsc -b && vite build`) |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3d. Set environment variables on Vercel

In the Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_CONVEX_URL` | `https://your-project-name.convex.cloud` (your **production** Convex URL) |

This is the critical one — it tells your frontend to connect to the production Convex backend instead of your dev deployment.

### 3e. Deploy

Click **Deploy**. Vercel will run `npm run build`, which compiles TypeScript and builds the Vite app, then serves the `dist/` folder.

---

## Step 4: Post-Deploy Configuration

### 4a. Update `CONVEX_SITE_URL` to your actual Vercel URL

Once Vercel gives you a domain (e.g. `https://cultif.vercel.app`), go back and update the Convex environment variable:

```bash
npx convex env set CONVEX_SITE_URL https://cultif.vercel.app --prod
```

This is needed for Convex Auth to correctly validate tokens and set CORS headers.

### 4b. If you have a custom domain

If you add a custom domain on Vercel (e.g. `https://cultif.com`), update `CONVEX_SITE_URL` again to match that domain.

---

## Step 5: Future Deployments

For ongoing development, here's the workflow:

- **Frontend changes only**: Push to GitHub → Vercel auto-deploys
- **Convex function changes** (anything in `convex/`): Run `npx convex deploy` manually before or after pushing. Vercel does NOT deploy Convex functions — you must do this separately.

### Automating Convex deploys in CI

To deploy Convex functions automatically when you push:

1. Get a **Deploy Key** from the Convex dashboard → Project Settings → Deploy Keys
2. Add `CONVEX_DEPLOY_KEY` as an environment variable on Vercel
3. Update your Vercel build command to:

   ```
   npx convex deploy --cmd "npm run build"
   ```

   This deploys Convex functions first, then builds the frontend in one step.

---

## Quick Checklist

- [ ] `npx convex deploy` — push functions to production
- [ ] Set `CONVEX_SITE_URL` on Convex production to your Vercel URL
- [ ] Set auth secrets on Convex production (`AUTH_SECRET`)
- [ ] Set `AUTH_RESEND_KEY` on Convex production (required for sign-up; get key at resend.com)
- [ ] Push code to GitHub
- [ ] Import project on Vercel
- [ ] Set `VITE_CONVEX_URL` on Vercel to your production Convex URL
- [ ] Deploy on Vercel
- [ ] Verify auth and data flow work on the live site

---

## Environment Variables Reference

| Where | Variable | Description |
|-------|----------|-------------|
| **Convex (prod)** | `CONVEX_SITE_URL` | Your Vercel app URL (for auth CORS/validation) |
| **Convex (prod)** | `AUTH_SECRET` | Signing secret for Convex Auth |
| **Convex (prod)** | `AUTH_RESEND_KEY` | Resend API key (required for sign-up email verification). Get one at [resend.com](https://resend.com) |
| **Convex (prod)** | `AUTH_EMAIL_FROM` | Optional. Sender email, e.g. `Cultif <noreply@yourdomain.com>`. Must use a verified domain in Resend |
| **Vercel** | `VITE_CONVEX_URL` | Production Convex deployment URL |
| **Vercel (optional)** | `CONVEX_DEPLOY_KEY` | For auto-deploying Convex on each Vercel build |
