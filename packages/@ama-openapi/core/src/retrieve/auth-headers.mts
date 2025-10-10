import { type Registry, isAuthToken, isAuthBasic } from "../public_api.mjs";

/**
 * Get authentication headers from registry configuration
 * @param option
 */
export const getAuthHeaders = (option: Registry): Record<string, string> => {
  if (isAuthToken(option)) {
    return { Authorization: `Token ${option.authToken}` };
  } else if (isAuthBasic(option)) {
    const auth = Buffer.from(`${option.user || ''}:${option.password}`).toString('base64');
    return { Authorization: `Basic ${auth}` };
  }
  return {};
};
