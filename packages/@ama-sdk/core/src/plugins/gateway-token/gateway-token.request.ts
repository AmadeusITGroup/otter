import { ApiClient, ApiFetchClient } from '../../fwk';
import {AdditionalParamsRequest} from '../additional-params';
import {PluginRunner, RequestOptions, RequestPlugin} from '../core';
import {ExceptionReply} from '../exception';
import {FetchCredentialsRequest} from '../fetch-credentials';
import {Oauth2Api, Response} from './gateway-authentication';

/**
 * Plugin to get the gateway access token and save it
 *
 * @deprecated please use AmadeusGatewayTokenRequestPlugin from @ama-sdk/amadeus-gateway-sdk instead, will be removed in v10
 * @example
 * When configuring the ApiManager
 * ```typescript
 * const defaultGatewayAPIConfig = {
 *   baseUrl: 'https://test.airlines.api.amadeus.com',
 *   gatewayClientId: 'RgquoWaPkKmZ7acKUu1A2meEYVo94az7',
 *   gatewayClientSecret: 'AdUgFh4hu1dUUIE1'
 * };
 *
 * const gatewayPlugin = new GatewayTokenRequestPlugin(
 *   `${defaultGatewayAPIConfig.baseUrl}/v1/security/oauth2`,
 *   defaultGatewayAPIConfig.gatewayClientId,
 *   defaultGatewayAPIConfig.gatewayClientSecret
 * );
 *
 * // Api which needs the gateway access
 * const myApiConfiguration: ApiConfiguration = {
 *   basePath: myBasePath,
 *   requestPlugins: [
 *     ...
 *     gatewayPlugin
 *     ...
 *   ],
 *   replyPlugins: [...]
 * };
 */
export class GatewayTokenRequestPlugin implements RequestPlugin {
  /**
   * Default expiration time on the token in seconds
   * Corresponds to 8 hours
   */
  private readonly DEFAULT_EXPIRATION_TIME_S: number = 28800;

  /**
   * Buffer time in milliseconds. Allows to regenerate a new token before the expiration of the token.
   * Corresponds to 5 minutes
   */
  private readonly EXPIRATION_TIME_BUFFER_MS: number = 300000;

  /**
   * Promise of gateway URL
   */
  private gatewayUrl: Promise<string>;

  /**
   * Promise of gateway client id
   */
  private gatewayClientId: Promise<string>;

  /**
   * Promise of gateway client secret
   */
  private gatewayClientPrivate: Promise<string>;

  /**
   * guestOfficeId is either a method to be ran before each call to the Api Gateway to determine what is the guest
   * office ID to be used, or a Promise of office ID
   */
  private guestOfficeId: (() => Promise<string | undefined>) | Promise<string | undefined> | string | undefined;

  /**
   * Promise of the gateway call
   */
  private gatewayCallPromise?: Promise<Response>;

  /** API Client */
  private apiClient: ApiClient;

  /**
   * Initialize your plugin
   *
   * @param gatewayUrl The URL of the gateway
   * @param gatewayClientId The client id to authenticate to the gateway
   * @param gatewayClientPrivate The client private to authenticate to the gateway
   * @param basePath API Gateway base path (when targeting a proxy or middleware)
   * @param guestOfficeId used to override the default office ID
   * @param storageTokenKey
   */
  constructor(
    gatewayUrl: string | Promise<string>,
    gatewayClientId: string | Promise<string>,
    gatewayClientPrivate: string | Promise<string>,
    basePath: string,
    guestOfficeId?: (() => Promise<string | undefined>) | Promise<string | undefined> | string,
    private storageTokenKey: string = 'gateway-auth-tokens'
  ) {
    this.gatewayUrl = Promise.resolve(gatewayUrl);
    this.gatewayClientId = Promise.resolve(gatewayClientId);
    this.gatewayClientPrivate = Promise.resolve(gatewayClientPrivate);
    this.guestOfficeId = guestOfficeId;
    this.apiClient = new ApiFetchClient({requestPlugins: [new FetchCredentialsRequest()], replyPlugins: [new ExceptionReply()], basePath });
  }

  /**
   * Check if the gateway authorization token is stored and include it in the Authorization header.
   * If it is not stored yet, a call is triggered to the gateway in order to get this authorization token.
   *
   * @param gatewayUrl URL of the gateway
   * @param gatewayClientId Client id related to the gateway client configuration
   * @param gatewayClientPrivate Client private related to the gateway client configuration
   * @param guestOfficeId office ID to be used instead of the default one
   * office ID to be used
   */
  private async getStoreAuthHeader(gatewayUrl: string,
    gatewayClientId: string,
    gatewayClientPrivate: string,
    guestOfficeId?: (() => Promise<string | undefined>) | Promise<string | undefined> | string): Promise<{[key: string]: string}> {

    this.apiClient.options.basePath = gatewayUrl;
    const gatewayApi = new Oauth2Api(this.apiClient);
    const storedTokens: string | null = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(this.storageTokenKey) : null;
    const storedTokensParsed: {[clientId: string]: {token: string; expiresAt: number}} = storedTokens ? JSON.parse(storedTokens) : {};

    const officeId = typeof guestOfficeId === 'function' ? await guestOfficeId() : await guestOfficeId;
    const key = officeId ? `${gatewayClientId}-${officeId}` : `${gatewayClientId}-default`;

    let token = storedTokensParsed[key];
    if (!token || Date.now() + this.EXPIRATION_TIME_BUFFER_MS >= token.expiresAt) {
      try {
        if (!this.gatewayCallPromise) {
          this.gatewayCallPromise = gatewayApi.postAccessToken({
            // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
            bodyToProvide: { client_id: gatewayClientId, client_secret: gatewayClientPrivate, grant_type: 'client_credentials', guest_office_id: officeId }
          });
        }
        const response = await this.gatewayCallPromise;
        this.gatewayCallPromise = undefined;
        token = {token: response.access_token, expiresAt: Date.now() + (response.expires_in ? response.expires_in : this.DEFAULT_EXPIRATION_TIME_S) * 1000};
        if (typeof sessionStorage !== 'undefined') {
          storedTokensParsed[key] = token;
          sessionStorage.setItem(this.storageTokenKey, JSON.stringify(storedTokensParsed));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('An error occurred when trying to get the gateway authentication token ' + (e as string));
      }
    }

    if (token) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      return {Authorization: `Bearer ${token.token}`};
    }

    return {};
  }

  /**
   * Check if the gateway authorization token is stored and include it in the Authorization header.
   * If it is not stored yet, a call is triggered to the gateway in order to get this authorization token.
   *
   * @returns a function that take the actual headers as parameter and return an Promise containing the Authorization header and its value
   */
  private addGatewayToken(): (_headers: Headers) => Promise<{[key: string]: string}> {
    return async (_headers: Headers): Promise<{[key: string]: string}> => {
      const params = await Promise.all([this.gatewayUrl, this.gatewayClientId, this.gatewayClientPrivate]);
      return this.getStoreAuthHeader(params[0], params[1], params[2], this.guestOfficeId);
    };
  }

  /**
   * @inheritDoc
   */
  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: new AdditionalParamsRequest({headers: this.addGatewayToken()}).load().transform
    };
  }
}
