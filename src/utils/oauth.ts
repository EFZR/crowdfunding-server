import axios from "axios";
import Account from "../models/Account.model";
import { ProviderType } from "../types/Auth";

// Shape of a validation function
type ValidationFunction = (account: Account) => Promise<boolean>;

type AuthValidation = {
  [key in ProviderType]: ValidationFunction;
};

// Validation logic for Google
const validateGoogleAuth: ValidationFunction = async (account: Account) => {
  // Add real Google validation logic here
  try {
    const tokenResponse = await axios.post(process.env.GOOGLE_TOKEN_URI, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    });

    const {
      access_token,
      refresh_token,
      expires_in: expires_at,
      token_type,
      scope,
      id_token,
    } = tokenResponse.data;

    await Account.update(
      { refresh_token, access_token, expires_at, token_type, scope, id_token },
      { where: { userId: account.userId } }
    );

    return true;
  } catch (error) {
    console.log(error);
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
