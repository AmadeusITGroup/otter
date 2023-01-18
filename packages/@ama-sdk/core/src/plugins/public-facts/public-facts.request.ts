import {
  ClientFactsFactory,
  createJwtFactsEncoder as clientFactsPluginCreateJwtFactsEncoder,
  PublicFacts as ClientFactsPluginPublicFacts,
  ClientFactsRequestPlugin,
  ClientFactsRequestPluginOptions
} from '../client-facts/client-facts.request';

/**
 * @deprecated use PublicFacts from client-facts plugin instead, will be removed in v10
 *
 * Type that represent PublicFacts.
 * Even though the type itself is permissive to mirror what the backend accepts, it is strongly recommended to extend
 * it from an application in order to type it with the facts expected by the rules setup for that application.
 * @example
 * interface BookingPublicFacts extends PublicFacts {
 *   fact1: string;
 *   fact2: string;
 * }
 */
export type PublicFacts = ClientFactsPluginPublicFacts;

/**
 * @deprecated use ClientFactsFactory from client-facts plugin instead, will be removed in v10
 *
 * Factory function that receives the RequestOptions object in order to have a fine granularity to return
 * specific facts only on certain entry points.
 */
export type PublicFactsFactory<T extends PublicFacts = PublicFacts> = ClientFactsFactory<T>;

/**
 * @deprecated use ClientFactsRequestPluginOptions from client-facts plugin instead, will be removed in v10
 *
 * Options of the PublicFacts request plugin
 */
export interface PublicFactsRequestPluginOptions<T extends PublicFacts = PublicFacts> extends ClientFactsRequestPluginOptions<T> {}

/**
 * @deprecated use createJwtFactsEncoder fromn client-facts plugin instead, will be removed in v10
 *
 * Creates a JWT encoding function which transforms the provided Facts as a unsecured JWT format https://tools.ietf.org/html/rfc7519#section-6
 */
export const createJwtFactsEncoder = clientFactsPluginCreateJwtFactsEncoder;

/**
 * @deprecated use ClientFactsPlugin instead, will be removed in v10
 *
 * Plugin to manage Public facts send to the API.
 * Facts are represented as an object of strings or numbers.
 *
 * The plugin allows to define two layers of facts:
 *   - Global: synchronous map of facts sent with every request
 *   - Request: function that is called with all the request information where you can return specific facts for every request
 * If both are defined for a request, the priority is given to request specific facts.
 *
 * Facts are stringified and encoded in base64 and are added to every requests as a Header that is configurable.
 * @example only global facts
 * const publicFactsPlugin = new PublicFactsRequestPlugin<BookingPublicFacts>({
 *   initialGlobalFacts: {
 *     country: 'FRA'
 *   }
 * });
 * @example request facts
 * const publicFactsPlugin = new PublicFactsRequestPlugin<BookingPublicFacts>({
 *   factsFactory: (request) => {
 *     if (request.basePath.includes('/order/')) {
 *       return {
 *         specificFact: 'foo'
 *       };
 *     }
 *     return {};
 *   }
 * });
 * @example global facts based on Store value
 * const publicFactsPlugin = new PublicFactsRequestPlugin<BookingPublicFacts>({});
 *
 * store.pipe(
 *        select(selectOrderEntity)
 *      ).subscribe((order) => {
 *        const facts = getFactsFromOrder(order);
 *        publicFactsPlugin.setGlobalFacts(facts);
 * });
 * @example request facts based on Store value
 *  const publicFactsPlugin = new PublicFactsRequestPlugin<BookingPublicFacts>({
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
 */
export class PublicFactsRequestPlugin<T extends PublicFacts = PublicFacts> extends ClientFactsRequestPlugin<T> {}
