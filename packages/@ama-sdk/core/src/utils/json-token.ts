import {ab2str, encryptPayload, generateContentEncryptionKey, generateIV, wrapContentEncryptionKey} from './crypto';
import {Encoder} from './encoder';

/**
 * Encode a Unicode string in base64
 *
 * @param str String to convert
 */
function base64EncodeUnicode(str: string) {
  // First we escape the string using encodeURI to get the UTF-8 encoding of the characters,
  // then we convert the percent encodings into raw bytes, and finally feed it to btoa() function.

  // encodeURI escape all non-ASCII characters but we don't want to escape latin non-ascii characters
  // (charCode between 128 and 255).
  return window.btoa(encodeURI(str)
    .replace(/%C2%([89AB][0-9A-F])/g, (_match, p1: string) => String.fromCharCode(parseInt('0x' + p1, 16)))
    .replace(/%C3%([89AB][0-9A-F])/g, (_match, p1: string) => String.fromCharCode(parseInt('0xc0', 16) + parseInt('0x' + p1, 16) - parseInt('0x80', 16)))
    .replace(/%([0-9A-F]{2})/g, (_match, p1: string) => String.fromCharCode(parseInt('0x' + p1, 16))));
}

/**
 * Decode a Unicode string from base64
 *
 * @param str String to convert
 */
function base64DecodeUnicode(str: string) {
  // Once the provided string is decoded from based64, we convert each character in its hexadecimal
  // value prefixed with the % character to make it URI compatible.
  const hexString = window.atob(str).replace(/./g, (match) => '%' + match.charCodeAt(0).toString(16));
  return decodeURI(hexString);
}

/**
 * Make a Base64 encoded string URL friendly,
 * i.e. '+' and '/' are replaced with '-' and '_' also any trailing '='
 * characters are removed
 *
 * @param str the encoded string
 */
export function base64EncodeUrl(str: string) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Recreate a Base64 encoded string that was made URL friendly
 * '-' and '_' are replaced with '+' and '/' and also it is padded with '='
 *
 * @param str the encoded string
 */
export function base64DecodeUrl(str: string) {
  // Pad out with standard base64 required padding characters
  str = (str + '===').slice(0, str.length + (str.length % 4));
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

/**
 * Creates a base64 encoding function depending on whether the plugin is run from a browser or from NodeJS.
 */
export function createBase64Encoder() {
  // Web browsers
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return (data: string) => base64EncodeUnicode(data);
  }

  // NodeJS
  if (typeof Buffer === 'function') {
    return (data: string) => Buffer.from(data).toString('base64');
  }

  throw new Error('Cannot convert string to base64, both btoa and Buffer are undefined.');
}

/**
 * Creates a base64 decoding function depending on whether the plugin is run from a browser or from NodeJS.
 */
export function createBase64Decoder() {
  // Web browsers
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return (data: string) => base64DecodeUnicode(data);
  }

  // NodeJS
  if (typeof Buffer === 'function') {
    return (data: string) => Buffer.from(data, 'base64').toString();
  }

  throw new Error('Cannot convert base64 to string, both atob and Buffer are undefined.');
}

/**
 * Creates a base64Url encoding function depending on whether the plugin is run from a browser or from NodeJS.
 */
export function createBase64UrlEncoder() {
  // Web browsers
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return (data: string) => base64EncodeUrl(base64EncodeUnicode(data));
  }

  // NodeJS
  if (typeof Buffer === 'function') {
    return (data: string) => base64EncodeUrl(Buffer.from(data).toString('base64'));
  }

  throw new Error('Cannot convert string to base64, both btoa and Buffer are undefined.');
}

/**
 * Creates a base64Url decoding function depending on whether the plugin is run from a browser or from NodeJS.
 */
export function createBase64UrlDecoder() {
  // Web browsers
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return (data: string) => base64DecodeUnicode(base64DecodeUrl(data));
  }

  // NodeJS
  if (typeof Buffer === 'function') {
    return (data: string) => Buffer.from(base64DecodeUrl(data), 'base64').toString();
  }

  throw new Error('Cannot convert base64 to string, both atob and Buffer are undefined.');
}

/**
 * Creates a JWT encoding function which transforms the provided payload as a unsecured JWT format https://tools.ietf.org/html/rfc7519#section-6
 */
export function createJwtEncoder() {
  const encoder = createBase64UrlEncoder();
  const jwtHeader = {
    alg: 'none',
    typ: 'JWT'
  };

  return (jwtPayload: {[key: string]: any}) => `${encoder(JSON.stringify(jwtHeader))}.${encoder(JSON.stringify(jwtPayload))}.`;
}


//  TODO: crypto implem for nodejs

/**
 * Creates a JSON Web Encryption token Encoder which from the provided key id,
 * payload and the public properties returns a token as a JWE Compact Serialization format https://datatracker.ietf.org/doc/html/rfc7516#section-3.1
 *
 * @param aesTagLengthInBits The AES tag length, in bits.
 * @param useHeaderAsAAD Whether or not the JWE's header should be used as Additional Authenticated Data to guarantee it has not been altered at decryption
 */
export function createJweEncoder(aesTagLengthInBits = 128, useHeaderAsAAD = false) {
  const base64Encoder = createBase64UrlEncoder();
  const stringEncoder = typeof window.TextEncoder !== 'undefined' ? new TextEncoder() : new Encoder();

  return async ({publicKey, keyId}: {publicKey: Promise<CryptoKey> | CryptoKey; keyId: string}, jwePayload: Record<string, unknown>, publicProperties: string[]) => {
    const jweHeader = {
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      typ: 'JWE',
      kid: keyId
    };
    publicProperties.forEach(property => {
      if (jwePayload[property]) {
        jweHeader[property] = jwePayload[property];
      }
    });

    const cek = await generateContentEncryptionKey();
    const wrappedCek = await wrapContentEncryptionKey(await publicKey, cek);
    const iv = generateIV();

    const serializedHeader = base64Encoder(JSON.stringify(jweHeader));

    const {ciphertext, authenticationTag} = await encryptPayload(
      iv,
      cek,
      stringEncoder.encode(JSON.stringify(jwePayload)),
      aesTagLengthInBits,
      useHeaderAsAAD ? stringEncoder.encode(serializedHeader) : undefined
    );

    return serializedHeader + '.' +
      base64Encoder(ab2str(wrappedCek)) + '.' +
      base64Encoder(ab2str(iv.buffer)) + '.' +
      base64Encoder(ab2str(ciphertext)) + '.' +
      base64Encoder(ab2str(authenticationTag));
  };
}
