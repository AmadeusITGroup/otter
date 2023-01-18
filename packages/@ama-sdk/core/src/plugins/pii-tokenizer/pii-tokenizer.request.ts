import { createJweEncoder, createJwtEncoder } from '../../utils/json-token';
import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Creates a JWT encoding function which transforms the provided token-value associations as a unsecured JWT format https://tools.ietf.org/html/rfc7519#section-6
 *
 * @param applicationId Identifier of the application
 * @param expirationDelay Delay after which the generated JWT has to be considered obsolete (in seconds)
 */
export function createJwtPiiEncoder(applicationId: string, expirationDelay = 3600) {
  const jwtEncoder = createJwtEncoder();

  const jwtPayload = (values: {[key: string]: string}) => {
    const timestamp: number = Math.floor(Date.now() / 1000);

    return {
      sub: 'pii',
      iat: timestamp,
      exp: timestamp + expirationDelay,
      iss: applicationId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'ama-tokens': values
    };
  };

  return (values: {[token: string]: string}) => jwtEncoder(jwtPayload(values));
}

/**
 * Creates a JWE encoding function which transforms the provided token-value associations into a secured JWT format https://tools.ietf.org/html/rfc7519
 *
 * @param applicationId Identifier of the application
 * @param expirationDelay Delay after which the generated JWE has to be considered obsolete (in seconds). Default to 3600s.
 * @param key Object containing the public key and its id
 * @param key.publicKey key used to encrypt the JWE
 * @param key.keyId Key id
 * @param publicProperties Payload's properties added to the header
 * @param useHeaderAsAAD Whether or not the JWE's header should be used as Additional Authenticated Data to guarantee it has not been altered at decryption
 */
export function createJwePiiEncoder(
  applicationId: string,
  expirationDelay = 3600,
  key: {publicKey: Promise<CryptoKey> | CryptoKey; keyId: string},
  publicProperties: string[] = [],
  useHeaderAsAAD = false) {
  const jweEncoder = createJweEncoder(128, useHeaderAsAAD);

  const jwePayload = (values: {[key: string]: string}) => {
    const timestamp = Math.floor(Date.now() / 1000);

    return {
      sub: 'pii',
      iat: timestamp,
      exp: timestamp + expirationDelay,
      iss: applicationId,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'ama-tokens': values
    };
  };

  return (values: {[token: string]: string}) => jweEncoder(key, jwePayload(values), publicProperties);
}

/**
 * Options of the plugin.
 */
export interface PiiTokenizerRequestPluginOptions {
  /** Identifier of the application (used to indicate which application generated the JWT) */
  applicationId: string;

  /** Delay after which the generated JWT has to be considered obsolete (in seconds). */
  expirationDelay?: number;

  /**
   * Name of the header to append the generated JWT containing the token-value associations to
   *
   * @default ama-client-facts
   */
  headerName?: string;

  /**
   * Name of the header that will contain the response to a deeplink token challenge, if any
   *
   * @default ama-client-facts-challenge
   */
  challengeHeaderName?: string;

  /** Boolean to specify if an error should be silent or crash the application */
  silent?: boolean;

  /** Key used to encrypt JWT. If specified, the JWT sent will be secure */
  key?: {
    /** Public key used to wrap the token's content encryption key */
    publicKey: Promise<CryptoKey> | CryptoKey;
    /** The key ID will be sent as the "kid" claim of the JWE so that the backend knows which private key it should use for decryption. */
    keyId: string;
  };

  /**
   * Payload's properties appended to the header for the JWE generation.
   * If key is specified and public properties is undefined, it will be defaulted to ['iss','sub'] */
  publicProperties?: string[];

  /**
   * Boolean to specify if the JWE header should be authenticated with the payload encryption via AES-GCM Additional authenticated data.
   * This will ensure that decryption will fail if the Header is altered by an attacker.
   */
  useHeaderAsAdditionalAuthenticatedData?: boolean;
}

/**
 * Plugin to replace sensitive parameters from URL with tokens.
 * The values corresponding to the tokens are added to the headers of the request as a JWT.
 * If the key parameter is specified, the generated token will be encrypted.
 *
 * There are two modes:
 *   - JWT Encoder, which encodes a token with the provided values
 *   - DeepLink, which just appends a provided token to the headers.
 *     It is used if deepLinkOptions is provided, overriding the JWT Encoder.
 *
 * Note that the tokenization should be enabled in the ApiClient to use the JWT Encoder mode but it's
 * not necessary for the DeepLink mode.
 *
 *
 * @example JWT
 *
 * const client = new ApiFetchClient({
 *   basePath: 'https://my.proxy.address'
 *   requestPlugins: [
 *     new PiiTokenizerRequest({applicationId: 'EXAMPLE_JWT'})
 *   ]
 * })
 * @example JWE without publicProperties
 *
 * const client = new ApiFetchClient({
 *   basePath: 'https://my.proxy.address'
 *   requestPlugins: [
 *     // the key is specified, hence it will generate an encrypted token
 *     // the generated token will have by default the properties 'iss' and 'sub' from the token playload, added to the header
 *     new PiiTokenizerRequest({applicationId: 'EXAMPLE_JWE', key: {publickKey: myPublicKey, keyId: myKeyId}})
 *   ]
 * })
 *
 * @example JWE with publicProperties
 *
 * const client = new ApiFetchClient({
 *   basePath: 'https://my.proxy.address'
 *   requestPlugins: [
 *     // the generated token will have the properties 'iss', 'sub' and 'myPublicProperty' added to the header
 *     new PiiTokenizerRequest({applicationId: 'EXAMPLE_JWE', key: {publickKey: myPublicKey, keyId: myKeyId}, publicProperties: ['iss', 'sub', 'myPublicProperty']})
 *   ]
 * })
 *
 * @example DeepLink
 *
 * const client = new ApiFetchClient({
 *   basePath: 'https://my.proxy.address'
 *   requestPlugins: [
 *     new PiiTokenizerRequest({applicationId: 'EXAMPLE_DEEPLINK'})
 *   ]
 * })
 *
 * const cartApi = new CartApi(client)
 * const deepLinkOptions = {token: 'deeplink-token-with-sensitive-values'}
 *
 * // Call with DeepLink, the parameters are passed as tokens
 * // DeepLink Options are provided, hence DeepLink will be used
 * await cartApi.retrieveCart({cartId: '$cartId$', lastName: '$lastName$'}, {deepLinkOptions})
 */
export class PiiTokenizerRequest implements RequestPlugin {

  /** Name of the header to append the token-value associations to */
  private tokensHeader: string;

  /** Name of the header that will contain the response to a deeplink token challenge, if any */
  private challengeHeader: string;

  /** Token encoding function */
  private tokenEncoder;

  /** Boolean to specify if an error should be silent or crash the application */
  private silent: boolean;

  /**
   * Initialize your plugin
   *
   * @param options Options of the plugin
   */
  constructor(options: PiiTokenizerRequestPluginOptions) {
    this.tokensHeader = options.headerName || 'ama-client-facts';
    this.challengeHeader = options.challengeHeaderName || 'ama-client-facts-challenge';
    this.silent = options.silent || false;
    if (options.key) {
      this.tokenEncoder = createJwePiiEncoder(options.applicationId, options.expirationDelay, options.key, options.publicProperties || ['iss', 'sub'], options.useHeaderAsAdditionalAuthenticatedData);
    } else {
      this.tokenEncoder = createJwtPiiEncoder(options.applicationId, options.expirationDelay);
    }
  }

  /**
   * Append the generated token based on the request options to the tokens header
   *
   * @param requestOptions Request options to generate the token
   */
  private async appendEncodedToken(requestOptions: RequestOptions) {
    try {
      return await this.tokenEncoder(requestOptions.tokenizedOptions!.values);
    } catch (e) {
      if (this.silent) {
        // eslint-disable-next-line no-console
        console.error('Couldn\'t encode the token');
      } else {
        throw new Error('Couldn\'t encode the token');
      }
    }
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        if (data.metadata?.deepLinkOptions) {
          const {token, challengeAnswers} = data.metadata.deepLinkOptions;
          data.headers.append(this.tokensHeader, token);
          if (challengeAnswers) {
            data.headers.append(this.challengeHeader, JSON.stringify(challengeAnswers));
          }
        }
        else if (!data.tokenizedOptions) {
          // eslint-disable-next-line no-console
          console.error('No tokenized options found. Please make sure tokenization is enabled on your ApiClient');
        }
        else if (Object.keys(data.tokenizedOptions.values).length > 0) {
          data.basePath = data.tokenizedOptions.url;
          data.queryParams = {...data.queryParams, ...data.tokenizedOptions.queryParams};
          const token = await this.appendEncodedToken(data);
          if (token) {
            data.headers.append(this.tokensHeader, token);
          }
        }
        return data;
      }
    };
  }

}
