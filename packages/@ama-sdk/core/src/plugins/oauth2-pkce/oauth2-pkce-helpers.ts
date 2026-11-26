/**
 * Characters allowed in a PKCE code verifier (unreserved characters as defined in RFC 7636)
 * @see https://datatracker.ietf.org/doc/html/rfc7636#section-4.1
 */
const UNRESERVED_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Encode bytes to a base64url string without padding (as defined in {@link https://datatracker.ietf.org/doc/html/rfc4648#section-5|RFC 4648 §5})
 * @param bytes Bytes to encode
 */
export function base64UrlEncodeBytes(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a cryptographically random string composed of unreserved characters
 * @param length Length of the string to generate
 */
export function generateRandomString(length: number): string {
  // Reject the values above the largest multiple of the alphabet length to avoid modulo bias
  const maxValidValue = 256 - (256 % UNRESERVED_CHARACTERS.length);
  let result = '';
  while (result.length < length) {
    for (const value of crypto.getRandomValues(new Uint8Array(length))) {
      if (value < maxValidValue && result.length < length) {
        result += UNRESERVED_CHARACTERS[value % UNRESERVED_CHARACTERS.length];
      }
    }
  }
  return result;
}

/**
 * Generate a PKCE code verifier ({@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1|RFC 7636 §4.1})
 * @param length Length of the code verifier (between 43 and 128)
 */
export function generateCodeVerifier(length = 64): string {
  if (length < 43 || length > 128) {
    throw new Error('The PKCE code verifier length must be between 43 and 128 characters');
  }
  return generateRandomString(length);
}

/**
 * Compute the S256 PKCE code challenge of a code verifier ({@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.2|RFC 7636 §4.2})
 * @param codeVerifier Code verifier
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return base64UrlEncodeBytes(new Uint8Array(digest));
}
