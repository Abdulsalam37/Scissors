export default {
  providers: [
    {
      domain: "https://clerk.scissor.dev/", // This acts as a fallback, overridden by CLERK_JWT_ISSUER_DOMAIN in Convex settings
      applicationID: "convex",
    },
  ],
};
