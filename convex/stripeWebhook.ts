"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export const processStripeWebhook = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, args): Promise<{ status: number; message: string }> => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { status: 500, message: "Webhook not configured" };
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(args.body, args.signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { status: 400, message: `Webhook signature verification failed: ${message}` };
    }

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subRef === "string"
            ? subRef
            : subRef?.id;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const convexUserId = subscription.metadata?.convexUserId;
        const chefId = subscription.metadata?.chefId;
        const plan = subscription.metadata?.plan as "monthly" | "annual" | undefined;
        const periodEnd = subscription.items?.data?.[0]?.current_period_end;

        if (convexUserId && chefId) {
          await ctx.runMutation(internal.subscriptions.setSubscriptionFromWebhook, {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            customerExternalId: convexUserId,
            chefId,
            status: "active",
            currentPeriodEnd: periodEnd
              ? periodEnd * 1000
              : undefined,
            plan,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === "active" ? "active" : "canceled";
        const periodEnd = subscription.items?.data?.[0]?.current_period_end;
        await ctx.runMutation(internal.subscriptions.updateSubscriptionStatusByStripeId, {
          stripeSubscriptionId: subscription.id,
          status,
          currentPeriodEnd: periodEnd
            ? periodEnd * 1000
            : undefined,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(internal.subscriptions.updateSubscriptionStatusByStripeId, {
          stripeSubscriptionId: subscription.id,
          status: "revoked",
        });
        break;
      }
    }

    return { status: 200, message: "OK" };
  },
});
