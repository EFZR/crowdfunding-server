import z from "zod";

export const accountType = z.enum(["oauth", "saml", "password"]);

export type AccountType = z.infer<typeof accountType>;

export const providerType = z.enum(["google", "facebook", "linkedin", "local"]);

export type ProviderType = z.infer<typeof providerType>;
