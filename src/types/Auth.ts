import z from "zod";

export const accountType = z.enum(["oauth", "saml", "password"]);

export const providerType = z.enum(["google", "facebook", "linkedin", "local"])
