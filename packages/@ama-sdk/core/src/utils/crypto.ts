import {MsCrypto, promisifyMsCrypto} from './ie11';

declare global {
  interface Window extends MsCrypto {}
}

/**
 * Converts an ArrayBuffer to a string.
 * @param buf ArrayBuffer to convert
 */
export function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

/**
 * Converts a string to an ArrayBuffer.
 * @param str String to convert
 */
export function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * Generates a 256 bytes AES-GCM key to be used as the ContentEncrytionKey
 */
export function generateContentEncryptionKey() {
  if (typeof window.msCrypto !== 'undefined') {
    return promisifyMsCrypto(window.msCrypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt']));
  }
  return window.crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt']);
}

/**
 * Generates an Initialization Vector of 96 bytes
 */
export function generateIV() {
  if (typeof window.msCrypto !== 'undefined') {
    return window.msCrypto.getRandomValues(new Uint8Array(12));
  }
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Wraps provided key using RSA-OAEP
 * @param publicKey Public key used to wrap the key
 * @param contentEncryptionKey Key to wrap
 */
export async function wrapContentEncryptionKey(publicKey: CryptoKey, contentEncryptionKey: CryptoKey) {
  if (typeof window.msCrypto !== 'undefined') {
    const bufferCek = await promisifyMsCrypto(window.msCrypto.subtle.exportKey('raw', contentEncryptionKey));
    // RSA doesn't output a tag so we cast the result to avoid an unnecessary runtime check
    return promisifyMsCrypto(window.msCrypto.subtle.encrypt({name: 'RSA-OAEP', hash: 'SHA-256'}, publicKey, new Uint8Array(bufferCek)));
  }
  return window.crypto.subtle.wrapKey('raw', contentEncryptionKey, publicKey, {name: 'RSA-OAEP'});
}

/**
 * Generates ciphertext and 96 bits authentication tag using AES-GCM
 * @param iv 96 bits Initialization Vector
 * @param key Symmetric Key used to encrypt the text
 * @param payload Text to encrypt
 * @param authenticationTagLength Length of the authentication tag AES will generate
 * @param additionalAuthenticatedData Additional cleartext data to authenticate. Altering them will make decryption impossible.
 */
export async function encryptPayload(iv: Uint8Array, key: CryptoKey, payload: Uint8Array, authenticationTagLength: number, additionalAuthenticatedData?: Uint8Array) {
  let ciphertext: ArrayBuffer;
  let authenticationTag: ArrayBuffer;
  const aesParams: AesGcmParams = {
    name: 'AES-GCM',
    iv,
    tagLength: authenticationTagLength
  };
  if (additionalAuthenticatedData) {
    aesParams.additionalData = additionalAuthenticatedData;
  }

  if (typeof window.msCrypto !== 'undefined') {
    // AES will output a tag so we cast to avoid unnecessary runtime check
    const aesOutput = await promisifyMsCrypto(window.msCrypto.subtle.encrypt(aesParams, key, payload)) as {ciphertext: ArrayBuffer; tag: ArrayBuffer};
    ciphertext = aesOutput.ciphertext;
    authenticationTag = aesOutput.tag;
  } else {
    const aesOutput = await window.crypto.subtle.encrypt(aesParams, key, payload);
    ciphertext = aesOutput.slice(0, -authenticationTagLength / 8);
    authenticationTag = aesOutput.slice(-authenticationTagLength / 8);
  }
  return {ciphertext, authenticationTag};
}
