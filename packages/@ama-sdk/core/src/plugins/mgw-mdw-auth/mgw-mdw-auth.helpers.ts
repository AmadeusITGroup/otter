/**
 * Computes the SHA256 digest of the given string
 * @param value Value to hash
 */
export async function sha256(value: string) {
  const utf8 = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

/**
 * Generates hash-based message authentication code using cryptographic hash function HmacSHA256 and the provided
 * secret key
 * Should only be in a NodeJS MDW context
 * @param value Value to hash
 * @param secretKey Secret cryptographic key
 */
export async function hmacSHA256(value: string, secretKey: string) {
  const enc = new TextEncoder();
  const algorithm = { name: 'HMAC', hash: 'SHA-256' };

  const key = await crypto.subtle.importKey('raw', enc.encode(secretKey), algorithm, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign(algorithm.name, key, enc.encode(value));
  const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return digest;
}
