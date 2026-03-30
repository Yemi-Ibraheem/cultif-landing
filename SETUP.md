# Cultif Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Convex**:
   ```bash
   npx convex dev
   ```
   - This will prompt you to log in/create account
   - Creates `.env.local` with your Convex URL
   - Starts the Convex dev server

3. **Configure Authentication**:
   
   Visit: https://labs.convex.dev/auth/config
   
   Choose one of:
   - **OAuth** (Recommended for MVP): Google, GitHub, Apple
   - **Magic Links**: Email-based authentication
   - **Password**: Email + password (requires more setup)
   
   Follow the setup instructions for your chosen method.

4. **Start the frontend** (in a new terminal):
   ```bash
   npm run dev:vite
   ```
   
   Or run both together:
   ```bash
   npm run dev
   ```

5. **Seed sample data** (optional):
   ```bash
   npx convex run seed:seedRecipes
   ```
   
   Note: You need at least one user created first (via sign up).

## Authentication Setup Details

### OAuth Setup (Easiest)

1. Go to https://labs.convex.dev/auth/config
2. Select "OAuth" provider
3. Choose Google/GitHub/Apple
4. Follow the provider-specific setup:
   - **Google**: Create OAuth credentials in Google Cloud Console
   - **GitHub**: Create OAuth app in GitHub settings
   - **Apple**: Set up Apple Developer account

### Password Auth Setup

1. Go to https://labs.convex.dev/auth/config
2. Select "Password" provider
3. Configure email settings (SMTP)
4. Set up email templates

### Magic Links Setup

1. Go to https://labs.convex.dev/auth/config
2. Select "Magic Links" provider
3. Configure email settings
4. Set up email templates

## Environment Variables

After running `npx convex dev`, you'll have a `.env.local` file:

```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

## Database Schema

The app uses these main tables:
- `users` - User profiles (extends Convex Auth users)
- `recipes` - Recipe data
- `savedRecipes` - User's saved recipes
- `mealPlans` - User meal plans

## Troubleshooting

### "No recipes available"
- Run the seed script: `npx convex run seed:seedRecipes`
- Make sure you have at least one user account created

### Authentication not working
- Check that you've configured auth providers at https://labs.convex.dev/auth/config
- Verify your `.env.local` has the correct `VITE_CONVEX_URL`
- Check browser console for errors

### Convex dev server issues
- Make sure you're logged in: `npx convex login`
- Check your Convex dashboard: https://dashboard.convex.dev

## Next Steps

1. Customize the auth flow in `src/pages/Auth.tsx`
2. Add recipe creation form for chefs
3. Implement recipe detail pages
4. Add chef profile pages
5. Implement meal planning features
6. Add search functionality
7. Add filtering and sorting

## Production Deployment

See the main README.md for production deployment instructions.
