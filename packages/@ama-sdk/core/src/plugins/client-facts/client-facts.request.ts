import {createJwtEncoder} from '../../utils/json-token';
import {PluginRunner, RequestOptions, RequestPlugin} from '../core';

/**
 * Type that represents public facts.
 * Even though the type itself is permissive to mirror what the backend accepts, it is strongly recommended to extend
 * it from an application in order to type it with the facts expected by the rules setup for that application.
 * @example
 * ```typescript
 * interface BookingPublicFacts extends PublicFacts {
 *   fact1: string;
 *   fact2: string;
 * }
 * ```
 */
export type PublicFacts = Record<string, string | number | undefined>;

/**
 * Factory function that receives the RequestOptions object in order to have a fine granularity to return
 * specific facts only on certain entry points.
 */
export type ClientFactsFactory<T extends PublicFacts = PublicFacts> = (request: RequestOptions) => Partial<T> | Promise<Partial<T>>;

/**
 * Options of the ClientFacts request plugin
 */
export interface ClientFactsRequestPluginOptions<T extends PublicFacts = PublicFacts> {
  /**
   * Name of the header where to store the encoded facts
   * @defaultValue 'ama-client-facts'
   */
  headerName?: string;

  /**
   * Initial value given to the global facts, sent with any API request
   */
  initialGlobalFacts?: T;

  /**
   * Already encrypted facts, sent as-is with any API request
   */
  privateFacts?: string;

  /**
   * Optional ClientFactsFactory that will be called for every API call to determine additional facts for specific requests
   */
  factsFactory?: ClientFactsFactory<T>;
}

/**
 * Creates a JWT encoding function which transforms the provided Facts as a unsecured JWT format https://tools.ietf.org/html/rfc7519#section-6
 */
export function createJwtFactsEncoder() {
  const jwtEncoder = createJwtEncoder();

  const jwtPayload = (data: PublicFacts) => ({
    sub: 'fact',
    ...data
  });

  return (data: PublicFacts) => jwtEncoder(jwtPayload(data));
}

/**
 * Plugin to manage client facts send to the API.
 * Public facts are represented as an object of strings or numbers.
 * Private facts are represented as strings.
 *
 * The plugin allows to define two layers of facts:
 * - Global: synchronous map of facts sent with every request
 * - Request: function that is called with all the request information where you can return specific facts for every request
 * If both are defined for a request, the priority is given to request specific facts.
 *
 * Facts are added to every requests as a Header that is configurable.
 * Public facts are stringified and encoded in base64 before.
 * @example only global public facts
 * ```typescript
 * const clientFactsPlugin = new ClientFactsRequestPlugin<BookingPublicFacts>({
 *   initialGlobalFacts: {
 *     country: 'FRA'
 *   }
 * });
 * ```
 * @example request public facts
 * ```typescript
 * const clientFactsPlugin = new ClientFactsRequestPlugin<BookingPublicFacts>({
 *   factsFactory: (request) => {
 *     if (request.basePath.includes('/order/')) {
 *       return {
 *         specificFact: 'foo'
 *       };
 *     }
 *     return {};
 *   }
 * });
 * ```
 * @example global public facts based on Store value
 * ```typescript
 * const clientFactsPlugin = new ClientFactsRequestPlugin<BookingPublicFacts>({});
 *
 * store.pipe(
 *        select(selectOrderEntity)
 *      ).subscribe((order) => {
 *        const facts = getFactsFromOrder(order);
 *        clientFactsPlugin.setGlobalFacts(facts);
 * });
 * ```
 * @example request public facts based on Store value
 * ```typescript
 *  const clientFactsPlugin = new ClientactsRequestPlugin<BookingPublicFacts>({
 *   factsFactory: (request) => {
 *     if (request.basePath.includes('/order/') && request.method !== 'GET') {
 *       return store.pipe(
 *         select(selectOrderEntity),
 *         take(1),
 *         map(getFactsFromOrder)
 *       ).toPromise();
 *     }
 *     return {};
 *   }
 * });
 * ```
 * @example private facts based on encrypted POST parameter
 * ```typescript
 * const clientFactsPlugin = new ClientFactsRequestPlugin({
 *   privateFacts: requestParametersService.getPostParameter('private-facts')
 * });
 * ```
 */
export class ClientFactsRequestPlugin<T extends PublicFacts = PublicFacts> implements RequestPlugin {

  /** Name of the header where to store the encoded facts */
  private readonly headerName: string;

  /** Function called for every API call to compute additional facts */
  private readonly factsFactory?: ClientFactsFactory<T>;

  /** Global facts that will be sent with every request */
  private globalFacts?: T;

  /** Private facts that will be sent as-is with every request */
  private privateFacts?: string;

  private readonly jwtEncoder = createJwtFactsEncoder();

  constructor(options: ClientFactsRequestPluginOptions<T>) {
    this.headerName = options.headerName || 'ama-client-facts';
    this.globalFacts = options.initialGlobalFacts;
    this.privateFacts = options.privateFacts;
    this.factsFactory = options.factsFactory;
  }

  /**
   * Change the value of the global facts
   * @param facts
   */
  public setGlobalFacts(facts: T) {
    this.globalFacts = facts;
  }

  /**
   * Change the value of the private facts
   * @param facts
   */
  public setPrivateFacts(facts: string) {
    this.privateFacts = facts;
  }

  public load(): PluginRunner<RequestOptions, RequestOptions> {
    return {
      transform: async (data: RequestOptions) => {
        const publicFacts = typeof this.factsFactory === 'function' ? {...this.globalFacts, ...(await this.factsFactory(data))} : this.globalFacts;
        if (publicFacts && Object.keys(publicFacts).length > 0) {
          data.headers.append(this.headerName, this.jwtEncoder(publicFacts));
        }
        if (this.privateFacts) {
          data.headers.append(this.headerName, this.privateFacts);
        }
        return data;
      }
    };
  }
}
