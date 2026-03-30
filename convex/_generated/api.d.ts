/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as auth from "../auth.js";
import type * as blogs from "../blogs.js";
import type * as countries from "../countries.js";
import type * as http from "../http.js";
import type * as mealPlans from "../mealPlans.js";
import type * as rateLimit from "../rateLimit.js";
import type * as recipes from "../recipes.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as stripeConnect from "../stripeConnect.js";
import type * as stripeConnectServer from "../stripeConnectServer.js";
import type * as stripeConnectWebhook from "../stripeConnectWebhook.js";
import type * as stripeServer from "../stripeServer.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as subscriptions from "../subscriptions.js";
import type * as turnstile from "../turnstile.js";
import type * as users from "../users.js";
import type * as videoChapters from "../videoChapters.js";
import type * as videos from "../videos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  auth: typeof auth;
  blogs: typeof blogs;
  countries: typeof countries;
  http: typeof http;
  mealPlans: typeof mealPlans;
  rateLimit: typeof rateLimit;
  recipes: typeof recipes;
  seed: typeof seed;
  stripe: typeof stripe;
  stripeConnect: typeof stripeConnect;
  stripeConnectServer: typeof stripeConnectServer;
  stripeConnectWebhook: typeof stripeConnectWebhook;
  stripeServer: typeof stripeServer;
  stripeWebhook: typeof stripeWebhook;
  subscriptions: typeof subscriptions;
  turnstile: typeof turnstile;
  users: typeof users;
  videoChapters: typeof videoChapters;
  videos: typeof videos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
