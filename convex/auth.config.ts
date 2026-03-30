export default {
  providers: [
    {
      // Use the built-in Convex site URL for the issuer domain.
      // This ensures the JWT 'iss' claim matches the Convex deployment.
      domain: (process.env.CONVEX_SITE_URL || 
        (process.env.NODE_ENV === "development" ? "http://localhost:5173" : "")
      ).replace(/\/$/, ""),
      applicationID: "convex",
    },
  ],
};

