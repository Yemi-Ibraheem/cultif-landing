import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";

const resendApiKey = process.env.AUTH_RESEND_KEY?.trim();
if (!resendApiKey) {
  console.error(
    "AUTH_RESEND_KEY is not set. Add it in Convex Dashboard → Settings → Environment Variables."
  );
}

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: resendApiKey ?? "",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const apiKey = (provider.apiKey || process.env.AUTH_RESEND_KEY || "").trim();
    if (!apiKey) {
      throw new Error(
        "AUTH_RESEND_KEY is not set in this Convex deployment. " +
          "Add it in Convex Dashboard → Settings → Environment Variables."
      );
    }
    const siteUrl = (process.env.SITE_URL || "http://localhost:5173").replace(/\/$/, "");
    const magicLink = `${siteUrl}/auth?code=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const resend = new ResendAPI(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM ?? "Cultif <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your Cultif account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">Welcome to Cultif</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Click the button below to verify your email and activate your account:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(160deg, #20b2aa 0%, #178f88 100%); color: white; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 10px;">
              Verify your email
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center; margin-bottom: 16px;">
            Or enter this code manually:
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 16px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1a1a1a;">${token}</span>
          </div>
          <p style="color: #999; font-size: 13px;">
            This link expires in 15 minutes. If you didn't create a Cultif account, you can ignore this email.
          </p>
        </div>
      `,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
