import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

const enableGoogleOAuth = process.env.VITE_ENABLE_GOOGLE_OAUTH === "true";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ...(enableGoogleOAuth ? [Google] : []),
    Password({ verify: ResendOTP, reset: ResendOTPPasswordReset }),
  ],
});
