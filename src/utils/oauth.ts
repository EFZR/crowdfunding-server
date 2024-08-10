import axios from "axios";

import Account from "../models/Account.model";
import { logger } from "./logging";
import { ProviderType } from "../types/Auth";

// Shape of a validation function
type ValidationFunction = (account: Account) => Promise<boolean>;

type AuthValidation = {
  [key in ProviderType]: ValidationFunction;
};

// Validation logic for Google
const validateGoogleAuth: ValidationFunction = async (account: Account) => {
  try {
    // Request for a new access token.
    const tokenResponse = await axios.post(process.env.GOOGLE_TOKEN_URI, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    });

    const {
      access_token,
      expires_in: expires_at,
      token_type,
      scope,
      id_token,
    } = tokenResponse.data;

    // Update old data
    await Account.update(
      { access_token, expires_at, token_type, scope, id_token },
      { where: { userId: account.userId } }
    );

    return true;
  } catch (error) {
    logger.critical("Error refreshing Google token.");
    return false;
  }
};

// Validation login for Facebook
const validateFacebookAuth: ValidationFunction = async (account: Account) => {
  // Add real Facebook validation logic here
  return false; // Placeholder: return true if validation passes
};

// Validation login for Linkedin
const validateLinkedinAuth: ValidationFunction = async (account: Account) => {
  // Add real Linkedin validation logic here
  return false; // Placeholder: return true if validation passes
};

// Validation login for Linkedin
const validateLocalAuth: ValidationFunction = async (account: Account) => {
  // Add real Local validation logic here
  return false; // Placeholder: return true if validation passes
};

// Validation map for all supported providers
export const authValidation: AuthValidation = {
  google: validateGoogleAuth,
  facebook: validateFacebookAuth,
  linkedin: validateLinkedinAuth,
  local: validateLocalAuth,
};

/**
 * Usage example
 * const provider: ProviderType = "google";
 * const isValid = authValidation[provider]({} as Account);
 *
 * if (!isValid) {
 *   console.error(`Validation failed for provider: ${provider}`);
 * }
 */
