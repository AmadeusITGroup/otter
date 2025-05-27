import { GetMe200Response } from '../../models/base/get-me200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

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

    let body: RequestBody = '';

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/v1/me`;
    const tokenizedUrl = `${this.client.options.basePath}/v1/me`;
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
    const url = this.client.options.enableParameterSerialization ? this.client.prepareUrlWithQueryParams(options.basePath, options.queryParams) : this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<GetMe200Response>(url, options, ApiTypes.DEFAULT, UsersApi.apiName, undefined, 'getMe');
    return ret;
  }

}
