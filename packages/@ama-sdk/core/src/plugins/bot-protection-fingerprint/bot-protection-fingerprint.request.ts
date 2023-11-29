import {PluginRunner, RequestOptions, RequestPlugin} from '../core';

/**
 * Function that returns the value of the fingerprint if available.
 */
export type BotProtectionFingerprintRetriever = () => string | undefined | Promise<string | undefined>;

/**
 * Represents the object exposed by Imperva for the integration of their Advanced Bot Protection script with Singe Page Apps.
 */
export interface ImpervaProtection {
  /**
   * Returns a Promise that resolves with the most recent valid token.
   * Rejects if token generation failed or reached the specified timeout
   *
   * @param timeout
   */
  token: (timeout: number) => Promise<string>;
}

declare global {
  interface Window {
    bmak?: any;
    protectionLoaded?: (protection: ImpervaProtection) => void;
  }
}

/**
 * Implementation based on Imperva's SPA integration feature developed for Amadeus.
 * This relies on a custom window property protectionLoaded that we feed with a callback that Imperva calls when the ABP script is loaded or when the callback is attached.
 * This callback is called with the Protection object used internally by the ABP that exposes a __token()__ function that returns a Promise of the most up-to-date token.
 *
 * @param protectionTimeout How long the retrieve will wait for the onProtectionLoaded event to be fired
 * @param tokenTimeout How long the ABP script will wait for a new token before rejecting the promise
 */
export function impervaProtectionRetrieverFactory(protectionTimeout: number, tokenTimeout: number): BotProtectionFingerprintRetriever {
  let protection: ImpervaProtection;

  if (typeof window === 'undefined') {
    throw new Error('impervaProtectionRetrieverFactory should be used in a browser context.');
  }

  const getProtection = () => {
    return new Promise<ImpervaProtection>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(`[SDK][Plug-in][BotProtectionFingerprintRequest] Timeout: no Protection object was received in time.
If the application runs on a domain that is not protected by Imperva, this plugin should be disabled.`),
        protectionTimeout);
      window.protectionLoaded = (protectionObject: ImpervaProtection) => {
        protection = protectionObject;
        clearTimeout(timeout);
        resolve(protectionObject);
      };
    });
  };

  return async () => {
    if (!protection) {
      try {
        protection = await getProtection();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return;
      }
    }

    try {
      return await protection.token(tokenTimeout);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[SDK][Plug-in][BotProtectionFingerprintRequest] Timeout: no Token was received in time.');
      return;
    }
  };
}

/**
 * Akamai loads a script on the first page, that will expose a bmak object on window
 * This bmak object exposes a function get_telemetry that will return the telemetry value to put in the akamai header
 */
export interface AkamaiObject {
  /** Method exposed by akamai to get telemetry */
  // eslint-disable-next-line @typescript-eslint/naming-convention,camelcase
  get_telemetry: () => string;
}

/**
 * Implementation of a retriever for Akamai based on bmak object from window or as parameter.
 * Will return the telemetry, or undefined if bmak object is not found
 *
 * @param bmakOpt BMak object from Akamai. Default to `window.bmak` on browser if not provided.
 */
export function akamaiTelemetryRetrieverFactory(bmakOpt?: AkamaiObject): BotProtectionFingerprintRetriever {
  const bmak = bmakOpt || (typeof window !== 'undefined' ? window.bmak : undefined);
  return () => {
    if (!bmak || !(typeof bmak.get_telemetry === 'function')) {
      return;
    }
    return bmak.get_telemetry();
  };
}

/**
 * Options to configure the fingerprint poller
 */
export interface BotProtectionFingerprintPollerOptions {
  /**
   * Amount of milliseconds to wait between two tries.
   */
  delayBetweenTriesInMilliseconds: number;

  /**
   * Maximum number of tries before giving up.
   */
  maximumTries: number;
}

/**
 * Options of the BotProtectionFingerprintRequest plugin
 */
export interface BotProtectionFingerprintRequestOptions {
  /**
   * Function that will be used to get the fingerprint value.
   * Implementation factories are provided for:
   * - Cookie
   * - localStorage
   *
   * But you can also provide your own.
   * Default: Cookie retriever for reese84.
   */
  fingerprintRetriever: BotProtectionFingerprintRetriever;

  /**
   * Name of the header that should contain the fingerprint. Default: X-D-Token
   */
  destinationHeaderName: string;

  /**
   * Stop trying to poll for subsequent requests after the execution of the first poller is done, either with a
   * timeout or because it found the fingerprint. Default: true
   */
  pollOnlyOnce?: boolean;

  /**
   * Configuration of the poller that will wait until the fingerprint is defined or a maximum configured number or tries
   * has been reached.
   * Leave undefined to test the fingerprint only once without delay.
   */
  pollerOptions?: BotProtectionFingerprintPollerOptions;
}

/**
 * Plug-in that allows to interact with Anti-Bot protection tools fingerprint like following:
 *   - Wait for the fingerprint to be present in the document before sending any call
 *   - Forward the fingerprint in a chosen request header with all the calls
 *
 * This plugin is modular and must be instantiated with the logic that retrieves the fingerprint value, also called {@link BotProtectionFingerprintRetriever}.
 * This file exports two factories of {@link BotProtectionFingerprintRetriever} to cover our two most common usecases:
 *  - Imperva ABP
 *  - Akamai telemetry
 * But you can also provide your own logic.
 *
 * In case this logic is unpredictable or subject to race conditions, you can configure a poller that will retry a maximum of N times every X milliseconds.
 * Note that both provided retrievers do not require a Poller setup.
 * By default, no poller is configured.
 *
 * <b>Important:</b> When used in conjunction with the AmadeusGatewayTokenRequestPlugin, an instance of
 * this plug-in has to be given to the AmadeusGatewayTokenRequestPlugin as well in order to make sure that the
 * authentication calls also contain the fingerprint.
 * You can reuse the same instance that you give to the SDK, or create a simpler instance without a poller in case you
 * make sure to load this plug-in before the AmadeusGatewayTokenRequestPlugin.
 *
 * @example Reusing the same instance
 *
 * export function apiFactory(eventTrackService: EventTrackService): ApiManager {
 *   const botProtection = new BotProtectionFingerprintRequest({
 *     destinationHeaderName: 'X-D-Token',
 *     fingerprintRetriever: impervaProtectionRetrieverFactory(200, 200)
 *   });
 *   const gateway = createAmadeusGatewayTokenRequest({
 *     gatewayUrl: 'https://my-gateway.com/v1/security/oauth2',
 *     gatewayClientId: '***',
 *     gatewayClientPrivate: '***',
 *     customApiClientOptions: {
 *       requestPlugins: [botProtection]
 *     }
 *   });
 *
 *   const apiConfig: BaseApiConstructor = {
 *     basePath: 'https://my-gateway.com/v2',
 *     requestPlugins: [botProtection, gateway],
 *     fetchPlugins: [new PerformanceMetricPlugin({
 *       onMarkComplete: (m: Mark) => eventTrackService.addSDKServerCallMark(m)
 *     })]
 *   };
 *   return new ApiManager(apiConfig, {
 *     LoggingApi: {basePath: '/api'}
 *   });
 * }
 * @example Using a custom FingerprintRetriever
 *
 * const botProtection = new BotProtectionFingerprintRequest({
 *   destinationHeaderName: 'X-D-Token',
 *   fingerprintRetriever: () => 'test'
 * });
 * @example For akamai
 *
 * const botProtection = new BotProtectionFingerprintRequest({
 *   destinationHeaderName: 'Akamai-BM-Telemetry',
 *   fingerprintRetriever: akamaiTelemetryRetrieverFactory()
 * });
 */
export class BotProtectionFingerprintRequest implements RequestPlugin {
  /**
   * Configuration of the plug-in instance
   */
  private readonly options: BotProtectionFingerprintRequestOptions;

  /**
   * Has a full poll cycle been performed once.
   */
  private hasPolled = false;

  constructor(options: BotProtectionFingerprintRequestOptions) {
    this.options = options;
  }

  /**
   * Returns the content of the fingerprint thanks to the retriever, either instantly or by trying as many times as
   * configured in the BotProtectionFingerprintPollerOptions.
   *
   * If pollOnlyOnce is set to true, the poller won't be executed again after it has been fully executed once.
   */
  private async waitForFingerprint() {
    const pollerOptions = this.options.pollerOptions;

    if (pollerOptions === undefined || this.options.pollOnlyOnce !== false && this.hasPolled) {
      return this.options.fingerprintRetriever();
    }

    for (let i = pollerOptions.maximumTries - 1; i >= 0; i--) {
      const fingerprint = await this.options.fingerprintRetriever();
      if (fingerprint) {
        this.hasPolled = true;
        return fingerprint;
      }
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, pollerOptions.delayBetweenTriesInMilliseconds));
      }
    }
    this.hasPolled = true;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (requestOptions: RequestOptions) => {
        const fingerprint = await this.waitForFingerprint();
        if (fingerprint) {
          requestOptions.headers.set(this.options.destinationHeaderName, fingerprint);
        }
        return requestOptions;
      }
    };
  }
}
