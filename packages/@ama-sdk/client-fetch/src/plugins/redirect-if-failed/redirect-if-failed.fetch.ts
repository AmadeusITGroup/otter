import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
} from '../../fetch-plugin';

export type RedirectIfFailedPluginContext = FetchPluginContext & { redirectPlugins?: Set<RedirectIfFailedFetch> };

/**
 * Plugin to Redirect to another fetch call
 */
export class RedirectIfFailedFetch implements FetchPlugin {
  /** The url to fallback when initial call fails */
  public readonly fallbackUrl: string;

  /**
   * RedirectIfFailed Fetch plugin
   * @param fallbackUrl
   */
  constructor(fallbackUrl: string) {
    this.fallbackUrl = fallbackUrl;
  }

  /**
   * Launch a redirect using the fallback url from context
   * @param context
   */
  private redirect(context: RedirectIfFailedPluginContext) {
    if (context.redirectPlugins?.has(this)) {
      throw new Error(`Redirection loop detected: ${this.fallbackUrl} already visited.`);
    }
    context.redirectPlugins ||= new Set();
    context.redirectPlugins.add(this);

    return context.fetchPlugins
      .reduce((asyncResponse, plugin) => plugin.transform(asyncResponse), fetch(context.url, { headers: context.options?.headers }));
  }

  /** @inheritDoc */
  public load(context: RedirectIfFailedPluginContext) {
    return {
      transform: async (fetchCall: FetchCall) => {
        try {
          const result = await fetchCall;
          if (!result.ok && !context.redirectPlugins?.has(this)) {
            context.url = this.fallbackUrl;
            return this.redirect(context);
          }
          return result;
        } catch (error) {
          if (!context.redirectPlugins?.has(this)) {
            context.url = this.fallbackUrl;
            return this.redirect(context);
          }
          if (context.redirectPlugins?.has(this)) {
            throw new Error(`Redirection loop detected: ${this.fallbackUrl} already visited.`);
          }
          throw error;
        }
      }
    };
  }
}
