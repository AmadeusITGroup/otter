import { GetMe200Response } from '../../models/base/get-me200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, Server, selectServerBasePath, } from '@ama-sdk/core';
import { SDK_SERVERS } from '../../constants/servers';
/** Parameters object to UsersApi's getMe function */
export interface UsersApiGetMeRequestData {
}
export class UsersApi implements Api {

  /** API name */
  public static readonly apiName = 'UsersApi';

  /** @inheritDoc */
  public readonly apiName = UsersApi.apiName;

  /** Tokens of the parameters containing PII */
  public readonly piiParamTokens: { [key: string]: string } = computePiiParameterTokens([]);

  /** @inheritDoc */
  public client: ApiClient;

  /**
   * Initialize your interface
   *
   * @param apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Get current user
   * Returns the user information for the currently authenticated user.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getMe(data: UsersApiGetMeRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetMe200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const operationServers = [
] as const satisfies Server[];

    const serverBasePath = selectServerBasePath(this.client.options, operationServers.length > 0 ? operationServers : SDK_SERVERS, this.client.options.logger);

    let body: RequestBody = '';

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${serverBasePath}/v1/me`;
    const tokenizedUrl = `${serverBasePath}/v1/me`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'GET',
      basePath,
      queryParams,
      paramSerializationOptions,
      body: body || undefined,
      metadata,
      tokenizedOptions,
      api: this
    };

    const options = await this.client.getRequestOptions(requestOptions);
    const url = this.client.prepareUrlWithQueryParams(options.basePath, options.queryParams, this.client.options.enableParameterSerialization);

    const ret = this.client.processCall<GetMe200Response>(url, options, ApiTypes.DEFAULT, UsersApi.apiName, undefined, 'getMe');
    return ret;
  }

}
