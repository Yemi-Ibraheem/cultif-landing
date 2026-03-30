"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verify = action({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not set");

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      const codes = data["error-codes"]?.join(", ") ?? "unknown";
      throw new Error(`Turnstile verification failed: ${codes}`);
    }

    return { success: true };
  },
});
