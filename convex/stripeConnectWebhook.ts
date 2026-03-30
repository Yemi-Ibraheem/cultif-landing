"use node";

import Stripe from "stripe";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function getRequiredEnv(name: string, helpText: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing. ${helpText}`);
  return value;
}

function getStripeClient(): Stripe {
  const stripeSecretKey = getRequiredEnv(
    "STRIPE_SECRET_KEY",
    "Set STRIPE_SECRET_KEY in your Convex dashboard (example: sk_test_...).",
  );
  return new Stripe(stripeSecretKey);
}

export const processConnectWebhook = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, args): Promise<{ status: number; message: string }> => {
    // Local testing helper:
    // stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated' --forward-thin-to <YOUR_LOCAL_ENDPOINT>
    // Placeholder: set STRIPE_WEBHOOK_SECRET in Convex env settings.
    const webhookSecret = getRequiredEnv(
      "STRIPE_WEBHOOK_SECRET",
      "Set STRIPE_WEBHOOK_SECRET in your Convex dashboard (example: whsec_...).",
    );
    const stripeClient = getStripeClient();

    try {
      // Thin events carry minimal payload. Verify signature first, then retrieve full event by ID.
      const thinEvent = stripeClient.webhooks.constructEvent(args.body, args.signature, webhookSecret);
      const event = await stripeClient.v2.core.events.retrieve(thinEvent.id);

      // Save an event snapshot to help debug webhook behavior in local demos.
      await ctx.runMutation(internal.stripeConnectServer.insertConnectWebhookEvent, {
        eventId: event.id,
        eventType: event.type,
        stripeAccountId: event.context,
        payload: JSON.stringify(event),
      });

      switch (event.type) {
        case "v2.core.account[requirements].updated":
          // Requirements changed (KYC, compliance, etc). UI still fetches current status live.
          break;
        case "v2.core.account[configuration.recipient].capability_status_updated":
          // Capability status changed (e.g. stripe_transfers). UI still fetches live status.
          break;
        default:
          // Ignore other events for this sample.
          break;
      }

      return { status: 200, message: "OK" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown webhook parsing error";
      return { status: 400, message: `Connect webhook error: ${message}` };
    }
  },
});

