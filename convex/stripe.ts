"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/**
 * Create a Stripe Product with monthly + annual Prices for a chef.
 * Call after startStripeProductSetup; pass the returned requestId.
 */
export const createStripeProduct = action({
  args: {
    requestId: v.id("stripeProductRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.runQuery(internal.stripeServer.getStripeProductRequest, {
      requestId: args.requestId,
    });
    if (!request) throw new Error("Setup request not found or already used");

    const stripe = getStripe();
    const name = request.productName || "Chef subscription";
    const monthlyCents = Math.max(50, Math.round(request.monthlyPrice * 100));
    const annualCents = Math.max(50, Math.round(request.annualPrice * 100));

    const product = await stripe.products.create({ name });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: monthlyCents,
      currency: "usd",
      recurring: { interval: "month" },
    });

    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: annualCents,
      currency: "usd",
      recurring: { interval: "year" },
    });

    await ctx.runMutation(internal.stripeServer.completeStripeProductSetup, {
      requestId: args.requestId,
      userId: request.userId,
      stripeProductId: product.id,
      stripePriceIdMonthly: monthlyPrice.id,
      stripePriceIdAnnual: annualPrice.id,
      monthlyPrice: request.monthlyPrice,
      annualPrice: request.annualPrice,
    });

    return {
      stripeProductId: product.id,
      stripePriceIdMonthly: monthlyPrice.id,
      stripePriceIdAnnual: annualPrice.id,
    };
  },
});

/**
 * Update prices on an existing Stripe Product for the current chef.
 * Archives old Prices and creates new ones.
 */
export const updateStripePrices = action({
  args: {
    monthlyPrice: v.number(),
    annualPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.stripeServer.getCurrentChefProducts);
    if (!user) throw new Error("Not authenticated or not a chef");
    if (!user.stripeProductId || !user.stripePriceIdMonthly || !user.stripePriceIdAnnual) {
      throw new Error("No existing products to update");
    }

    const stripe = getStripe();
    const monthlyCents = Math.max(50, Math.round(args.monthlyPrice * 100));
    const annualCents = Math.max(50, Math.round(args.annualPrice * 100));

    // Archive old prices
    await stripe.prices.update(user.stripePriceIdMonthly, { active: false });
    await stripe.prices.update(user.stripePriceIdAnnual, { active: false });

    // Create new prices on the same product
    const newMonthly = await stripe.prices.create({
      product: user.stripeProductId,
      unit_amount: monthlyCents,
      currency: "usd",
      recurring: { interval: "month" },
    });

    const newAnnual = await stripe.prices.create({
      product: user.stripeProductId,
      unit_amount: annualCents,
      currency: "usd",
      recurring: { interval: "year" },
    });

    await ctx.runMutation(internal.stripeServer.updateStoredPricesAndIds, {
      userId: user.userId,
      monthlyPrice: args.monthlyPrice,
      annualPrice: args.annualPrice,
      stripePriceIdMonthly: newMonthly.id,
      stripePriceIdAnnual: newAnnual.id,
    });
  },
});

/**
 * Create a Stripe Subscription for a user subscribing to a chef.
 * Returns the clientSecret needed for the embedded PaymentElement.
 */
export const createSubscription = action({
  args: {
    chefId: v.id("users"),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ subscriptionId: string; clientSecret: string }> => {
    const stripe = getStripe();

    const chef = await ctx.runQuery(internal.stripeServer.getChefStripeProducts, {
      chefId: args.chefId,
    });
    if (!chef) throw new Error("Chef not found");

    const priceId: string | undefined =
      args.plan === "monthly" ? chef.stripePriceIdMonthly : chef.stripePriceIdAnnual;
    if (!priceId) {
      throw new Error("Chef has not set up subscription pricing yet");
    }

    const currentUser = await ctx.runQuery(internal.stripeServer.getCurrentUserForCheckout);
    if (!currentUser) throw new Error("Not authenticated");

    let customerId: string | undefined;
    const existing = await stripe.customers.search({
      query: `metadata["convexUserId"]:"${currentUser.userId}"`,
    });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: args.customerEmail ?? undefined,
        name: args.customerName ?? undefined,
        metadata: { convexUserId: currentUser.userId },
      });
      customerId = newCustomer.id;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      metadata: {
        chefId: args.chefId,
        convexUserId: currentUser.userId,
        plan: args.plan,
      },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice | string | null;
    if (!invoice || typeof invoice === "string") {
      throw new Error("Could not retrieve invoice from subscription");
    }
    const expandedInvoice = invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | string | null };
    const paymentIntent = expandedInvoice.payment_intent;
    if (!paymentIntent || typeof paymentIntent === "string") {
      throw new Error("Could not retrieve payment intent from invoice");
    }

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret!,
    };
  },
});
