"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

function getRequiredEnv(name: string, helpText: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing. ${helpText}`);
  }
  return value;
}

function getStripeClient(): Stripe {
  // Placeholder: set STRIPE_SECRET_KEY in Convex environment variables.
  const stripeSecretKey = getRequiredEnv(
    "STRIPE_SECRET_KEY",
    "Set STRIPE_SECRET_KEY in your Convex dashboard (example: sk_test_...).",
  );
  return new Stripe(stripeSecretKey);
}

function sanitizeCurrency(raw: string): string {
  return raw.trim().toLowerCase();
}

export const createOrGetConnectedAccount = action({
  args: {
    displayName: v.string(),
    contactEmail: v.string(),
  },
  handler: async (ctx, args): Promise<{ accountId: string; created: boolean }> => {
    const currentUser = await ctx.runQuery(internal.stripeServer.getCurrentUserForCheckout, {});
    if (!currentUser?.userId) throw new Error("Not authenticated");
    const userId = currentUser.userId as Id<"users">;

    const existing: { stripeAccountId: string } | null = await ctx.runQuery(
      internal.stripeConnectServer.getMyConnectAccountMappingInternal,
      {
      userId,
      },
    );
    if (existing?.stripeAccountId) {
      return {
        accountId: existing.stripeAccountId,
        created: false,
      };
    }

    const stripeClient = getStripeClient();

    // IMPORTANT: account creation payload intentionally includes ONLY fields requested.
    // Never send top-level `type` for this V2 Connect account creation flow.
    const account = await stripeClient.v2.core.accounts.create({
      display_name: args.displayName,
      contact_email: args.contactEmail,
      identity: {
        country: "us",
      },
      dashboard: "express",
      defaults: {
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: {
                requested: true,
              },
            },
          },
        },
      },
    });

    await ctx.runMutation(internal.stripeConnectServer.upsertConnectAccountByUserId, {
      userId,
      stripeAccountId: account.id,
      displayName: args.displayName,
      contactEmail: args.contactEmail,
      country: "us",
    });

    return {
      accountId: account.id,
      created: true,
    };
  },
});

export const createOnboardingLink = action({
  args: {
    accountId: v.string(),
  },
  handler: async (_ctx, args) => {
    const stripeClient = getStripeClient();
    // Placeholder: set SITE_URL in Convex environment variables.
    const siteUrl = getRequiredEnv(
      "SITE_URL",
      "Set SITE_URL in your Convex dashboard (example: https://your-app.com).",
    );

    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: args.accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${siteUrl}/connect-demo`,
          return_url: `${siteUrl}/connect-demo?accountId=${encodeURIComponent(args.accountId)}`,
        },
      },
    });

    return {
      url: accountLink.url,
    };
  },
});

export const getConnectedAccountStatus = action({
  args: {
    accountId: v.string(),
  },
  handler: async (_ctx, args) => {
    const stripeClient = getStripeClient();
    const account = await stripeClient.v2.core.accounts.retrieve(args.accountId, {
      include: ["configuration.recipient", "requirements"],
    });

    const readyToReceivePayments =
      account?.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";
    const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status ?? "unknown";
    const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

    return {
      accountId: account.id,
      readyToReceivePayments,
      requirementsStatus,
      onboardingComplete,
    };
  },
});

export const createPlatformProductForConnectedAccount = action({
  args: {
    connectedAccountId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    priceInCents: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args): Promise<{ productId: string; mappingId: Id<"connectProducts"> }> => {
    const currentUser = await ctx.runQuery(internal.stripeServer.getCurrentUserForCheckout, {});
    if (!currentUser?.userId) throw new Error("Not authenticated");
    const userId = currentUser.userId as Id<"users">;

    const stripeClient = getStripeClient();
    const currency = sanitizeCurrency(args.currency);
    if (args.priceInCents < 50) {
      throw new Error("priceInCents must be at least 50 (for this demo).");
    }

    // Product is created on the platform account (no Stripe-Account header).
    const product = await stripeClient.products.create({
      name: args.name,
      description: args.description,
      default_price_data: {
        unit_amount: args.priceInCents,
        currency,
      },
    });

    const defaultPrice =
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id;

    const docId: Id<"connectProducts"> = await ctx.runMutation(
      internal.stripeConnectServer.insertConnectProductMappingInternal,
      {
      userId,
      stripeProductId: product.id,
      stripeDefaultPriceId: defaultPrice,
      connectedAccountId: args.connectedAccountId,
      name: args.name,
      description: args.description,
      unitAmount: args.priceInCents,
      currency,
      },
    );

    return {
      productId: product.id,
      mappingId: docId,
    };
  },
});

export const createDestinationCheckoutSession = action({
  args: {
    productDocId: v.id("connectProducts"),
    quantity: v.number(),
    applicationFeeAmount: v.number(),
  },
  handler: async (ctx, args): Promise<{ checkoutUrl: string; sessionId: string }> => {
    if (args.quantity < 1) throw new Error("quantity must be >= 1");
    if (args.applicationFeeAmount < 0) throw new Error("applicationFeeAmount must be >= 0");

    const stripeClient = getStripeClient();
    const mapping: {
      stripeProductId: string;
      currency: string;
      unitAmount: number;
      connectedAccountId: string;
    } | null = await ctx.runQuery(internal.stripeConnectServer.getConnectProductById, {
      productDocId: args.productDocId,
    });
    if (!mapping) throw new Error("Product mapping not found");

    // Placeholder: set SITE_URL in Convex environment variables.
    const siteUrl = getRequiredEnv(
      "SITE_URL",
      "Set SITE_URL in your Convex dashboard (example: https://your-app.com).",
    );

    const session: Stripe.Checkout.Session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: mapping.currency,
            product: mapping.stripeProductId,
            unit_amount: mapping.unitAmount,
          },
          quantity: args.quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: args.applicationFeeAmount,
        transfer_data: {
          destination: mapping.connectedAccountId,
        },
      },
      mode: "payment",
      success_url: `${siteUrl}/connect-demo?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/connect-demo?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL.");
    }

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },
});

