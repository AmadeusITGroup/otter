import type {
  OAuth2PkceRequest,
} from '@ama-sdk/core';
import type {
  FetchCall,
  FetchPlugin,
  FetchPluginContext,
} from '../../fetch-plugin';

/** Subset of the {@link OAuth2PkceRequest} plugin used to renew the access token */
export type OAuth2PkceTokenRenewer = Pick<OAuth2PkceRequest, 'invalidateAccessToken' | 'getAuthorizationHeaderValue'>;

/**
 * Plugin to renew the OAuth 2.0 access token and replay the call once when it is rejected by the API Gateway.
 * To be used with the {@link OAuth2PkceRequest} request plugin of `@ama-sdk/core`.
 */
export class OAuth2PkceUnauthorizedFetch implements FetchPlugin {
  /**
   * Renew the access token and replay the call when rejected by the API Gateway
   * @param tokenRenewer OAuth2PkceRequest plugin used to authenticate the calls
   * @param unauthorizedStatuses HTTP statuses for which the access token is considered as rejected
   * @param headerName Header in which the access token is sent
   */
  constructor(
    private readonly tokenRenewer: OAuth2PkceTokenRenewer,
    private readonly unauthorizedStatuses: number[] = [401],
    private readonly headerName = 'Authorization'
  ) {}

  private replay(context: FetchPluginContext, authorization: string) {
    const headers = new Headers(context.options.headers);
    headers.set(this.headerName, authorization);
    context.options.headers = headers;
    let asyncResponse = fetch(context.url, context.options);
    for (const plugin of context.fetchPlugins) {
      asyncResponse = plugin.transform(asyncResponse);
    }
    return asyncResponse;
  }

  /** @inheritDoc */
  public load(context: FetchPluginContext) {
    let replayed = false;

    return {
      transform: async (fetchCall: FetchCall) => {
        const response = await fetchCall;
        if (replayed || !this.unauthorizedStatuses.includes(response.status)) {
          return response;
        }
        replayed = true;
        await this.tokenRenewer.invalidateAccessToken();
        const authorization = await this.tokenRenewer.getAuthorizationHeaderValue();
        return authorization ? this.replay(context, authorization) : response;
      }
    };
  }
}
