import { v4 } from 'uuid';
import { ab2str, str2ab } from '../../utils/crypto';
import { createBase64Encoder, createBase64UrlEncoder } from '../../utils/json-token';
import { PluginRunner, RequestOptions, RequestPlugin } from '../core';

/**
 * Computes the SHA256 digest of the given string
 * @param value Value to hash
 */
export async function sha256(value: string) {
  // Web browsers
  if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined') {
    return ab2str(await crypto.subtle.digest('SHA-256', str2ab(value)));
  }
  // NodeJS
  try {
    return ab2str(require('node:crypto').createHash('sha256')
      .update(value)
      .digest('latin1'));
  } catch (err) {
    throw new Error('Crypto module is not available.');
  }
}

/**
 * Generates hash-based message authentication code using cryptographic hash function HmacSHA256 and the provided
 * secret key
 * Should only be in a NodeJS MDW context
 * @param value Value to hash
 * @param secretKey Secret cryptographic key
 */
export function hmacSHA256(value: string, secretKey: string) {
  try {
    return ab2str(require('node:crypto').createHmac('sha256', secretKey)
      .update(value)
      .digest('latin1'));
  } catch (err) {
    throw new Error('Crypto module is not available.');
  }
}

/**
 * Type that represents context data.
 */
type ContextData = Record<string, string | number | undefined>;

/**
 * Header definition of the JWS used for the API Manager authentication
 */
const jwsHeader = {
  alg: 'HS256',
  typ: 'JWT'
};

/**
 * Payload interface of the JWS used for the API Manager authentication
 */
export interface JsonTokenPayload {
  /**
   * Timestamp in second when the token was generated
   */
  iat: number;

  /**
   * Timestamp in second after which the token has to be considered obsolete
   */
  exp: number;

  /**
   * Application ID
   *
   * This ID is unique across all environments/phases.
   * It is made of :
   *  - Application name (as declared in Amadeus For Developers Portal)
   *  - Developer email
   *  - Phase name
   * APP ID  = <App name>__<Dev Email>__<Phase> (double "_")
   *
   */
  iss: string;

  /**
   * Acts as nonce (i.e. an arbitrary number that can be used just once in a cryptographic communication).
   * This is a String of a reasonable length (16 alpha-numeric characters for instance) that is base64-encoded.
   */
  jti: string;

  /**
   * Custom claim 'context' which plays the role of a container to convey application context data.
   * The context must be base64-encoded.
   */
  context?: string;
}

/**
 * Structured object representing the parameters expected by the MicroGatewayMiddlewareAuthenticationRequest plugin constructor
 */
export interface MicroGatewayMiddlewareAuthenticationRequestConstructor {
  /**
   * Application ID
   *
   * This ID is unique across all environments/phases.
   * It is made of :
   *  - Application name (as declared in Amadeus For Developers Portal)
   *  - Developer email
   *  - Phase name
   * APP ID  = <App name>__<Dev Email>__<Phase> (double "_")
   *
   */
  applicationId: string;

  /**
   * Interval in second to set the expiration time
   */
  expIntervalInSec: number;

  /**
   * Application context data
   */
  context: ContextData;

  /**
   * API key associated to the application ID
   */
  apiKey: string;

  /**
   * API secret associated to the application ID
   */
  secret: string;
}

/**
 * Plugin to send a JWS to authenticate on the API Manager.
 * This plugin will throw an error if used in a Browser context.
 */
export class MicroGatewayMiddlewareAuthenticationRequest implements RequestPlugin {

  /**
   * Application ID
   *
   * This ID is unique across all environments/phases.
   * It is made of :
   *  - Application name (as declared in Amadeus For Developers Portal)
   *  - Developer email
   *  - Phase name
   * APP ID  = <App name>__<Dev Email>__<Phase> (double "_")
   *
   */
  private readonly applicationId: string;

  /**
   * Interval in second to set the expiration time
   */
  private readonly expIntervalInSec: number;

  /**
   * Application context data
   */
  private readonly context: ContextData;

  /**
   * API key associated to the application ID
   */
  private readonly apiKey: string;

  /**
   * API secret associated to the application ID
   */
  private readonly secret: string;

  /**
   * Method used to encode a string in base64Url
   */
  private base64UrlEncoder;

  /**
   * Method used to encode a string in base64
   */
  private base64Encoder;

  /**
   * Initialize your plugin
   * @param options Options to initialize the plugin
   */
  constructor(options: MicroGatewayMiddlewareAuthenticationRequestConstructor) {
    if (typeof window !== 'undefined') {
      throw new Error('The plugin can only be used in a NodeJS context');
    }
    this.applicationId = options.applicationId;
    this.expIntervalInSec = options.expIntervalInSec;
    this.context = options.context;
    this.apiKey = options.apiKey;
    this.secret = options.secret;
    this.base64UrlEncoder = createBase64UrlEncoder();
    this.base64Encoder = createBase64Encoder();
  }

  /**
   * Generates payload with minimal information
   */
  private generatePayload(): JsonTokenPayload {
    const iatTime = Math.floor(Date.now() / 1000);
    const expTime = iatTime + this.expIntervalInSec;

    return {
      iss: this.applicationId,
      jti: this.base64Encoder(v4().toString()),
      iat: iatTime,
      exp: expTime,
      context: this.base64Encoder(JSON.stringify(this.context))
    };
  }

  /**
   * Computes the key used to sign the JWS
   * @param payload JWT payload
   * @param basePath Resource path
   */
  private async generateMicroGatewayAuthenticationSignatureKey(payload: JsonTokenPayload, basePath: string) {
    const subString = this.apiKey + await sha256(this.secret + payload.jti + payload.iat.toString() + basePath);
    return sha256(subString);
  }

  /**
   * Generates the signed JWT based on provided payload and secret key
   * @param payload JWT payload
   * @param secretKey secret key used to generate the signature
   */
  private sign(payload: JsonTokenPayload, secretKey: string) {
    const message = `${this.base64UrlEncoder(JSON.stringify(jwsHeader))}.${this.base64UrlEncoder(JSON.stringify(payload))}`;
    const signature = hmacSHA256(message, secretKey);
    return `${message}.${this.base64UrlEncoder(signature)}`;
  }

  /**
   * Generates a signed Json Web Token
   * @param path Resource path
   */
  private async generateJWS(path: string) {
    const payload = this.generatePayload();
    // Secret key used to generate the signature
    const secretKey = await this.generateMicroGatewayAuthenticationSignatureKey(payload, path);
    return this.sign(payload, secretKey);
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        // Handle Authorization Tokens
        const url = new URL(data.basePath);
        const token = await this.generateJWS(url.pathname);
        data.headers.append('Authorization', `Bearer ${token}`);
        return data;
      }
    };
  }
}
