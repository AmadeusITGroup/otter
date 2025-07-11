import { Flight } from '../../models/base/flight/index';
import { reviveFlight } from '../../models/base/flight/flight.reviver';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to DummyApi's dummyGet function */
export interface DummyApiDummyGetRequestData {
}
export class DummyApi implements Api {

  /** API name */
  public static readonly apiName = 'DummyApi';

  /** @inheritDoc */
  public readonly apiName = DummyApi.apiName;

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
   * Dummy get
   * Dummy get
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async dummyGet(data: DummyApiDummyGetRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<Flight> {
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
    const basePath = `${this.client.options.basePath}/dummy`;
    const tokenizedUrl = `${this.client.options.basePath}/dummy`;
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

    const ret = this.client.processCall<Flight>(url, options, ApiTypes.DEFAULT, DummyApi.apiName, { 200: reviveFlight } , 'dummyGet');
    return ret;
  }

}
