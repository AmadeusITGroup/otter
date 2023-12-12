import { PluginRunner, RequestOptions, RequestPlugin } from '../core';
import {createJwtEncoder} from '../../utils/json-token';

/**
 * Optional parameters of the plugin
 */
export interface SimpleApiKeyAuthenticationRequestOptions {
  /** Name of the header that will contain the API key */
  apiKeyHeader: string;

  /** Name of the header that will contain the context overrides */
  contextHeader: string;

  /** The Office ID to use as override */
  officeId?: string | (() => (string | Promise<string>));
}

/**
 * Default values of optional parameters
 */
const DEFAULT_OPTION: SimpleApiKeyAuthenticationRequestOptions = {
  apiKeyHeader: 'x-api-key',
  contextHeader: 'ama-ctx'
};

/**
 * Plugin to handle the Simple API key authentication with Apigee.
 * Note that this authentication mode has to be specifically activated per application and will be rejected by default.
 *
 * Provide the clientId of your application as the {@link apiKey}.
 * It can be a simple {@link string} or a function that returns a {@link string} or a {@link Promise} if your application
 * needs to change it at runtime.
 * You can also call the method {@link setApiKey} to change it programmatically.
 *
 * The plugin {@link options} allow to customize the headers which the plugin injects the API key and context overrides into.
 *
 * About context overrides: today only the Office ID is supported.
 * Like the {@link apiKey}, {@link options.officeId} can be a {@link string} or a function that returns a {@link string} or a {@link Promise}.
 * You can also call the method {@link setOfficeId} to change it programmatically.
 *
 * Examples of usage:
 * @example Static API key no override
 *
 * const plugin = new SimpleApiKeyAuthenticationRequest('myApiKey');
 * @example Static API key with static override
 *
 * const plugin = new SimpleApiKeyAuthenticationRequest('myApiKey', {
 *   officeId: 'NCE1A098A'
 * });
 * @example Dynamic API key as a promise
 *
 * const apiKeyFactory = () => firstValueFrom(store.pipe(
 *     select(someStateSelector)
 *     map(state => determineApiKeyToUse(state))
 *   )
 * );
 * const plugin = new SimpleApiKeyAuthenticationRequest(apiKeyFactory);
 * @example Dynamic API key and Office ID using setters
 *
 * const plugin = new SimpleApiKeyAuthenticationRequest('initialApiKey');
 * store.pipe(
 *   select(someStateSelector)
 * ).subscribe(state => {
 *   plugin.setApiKey(determineApiKeyToUse(state));
 *   plugin.setOfficeId(determineOfficeIdOverride(state));
 * });
 */
export class SimpleApiKeyAuthenticationRequest implements RequestPlugin {
  /** Options of the plugin */
  private readonly options: SimpleApiKeyAuthenticationRequestOptions;

  /** Api key to use for authentication */
  private apiKey: string | (() => (string | Promise<string>));

  /** Encoder used to create the Amadeus Context JWT */
  private readonly jwtEncoder = createJwtEncoder();

  /**
   * Initialize the plugin
   * @param apiKey The API key to use for authentication
   * @param options Options of the plugin
   */
  constructor(apiKey: string | (() => string | Promise<string>), options: Partial<SimpleApiKeyAuthenticationRequestOptions> = {}) {
    this.options = {
      ...DEFAULT_OPTION,
      ...options
    };
    this.apiKey = apiKey;
  }

  /**
   * Change the API key used for authentication
   * @param apiKey The API key to use for authentication
   */
  public setApiKey(apiKey: string | (() => string | Promise<string>)) {
    this.apiKey = apiKey;
  }

  /**
   * Change the Office ID override
   * @param officeId The Office ID to use as override
   */
  public setOfficeId(officeId: string | (() => string | Promise<string>)) {
    this.options.officeId = officeId;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {

        data.headers.set(this.options.apiKeyHeader, typeof this.apiKey === 'string' ? this.apiKey : await this.apiKey());
        if (this.options.officeId) {
          // create ama-ctx
          const officeId = typeof this.options.officeId === 'string' ? this.options.officeId : await this.options.officeId();
          data.headers.set(this.options.contextHeader, this.jwtEncoder({oid: officeId}));
        }

        return data;
      }
    };
  }
}
