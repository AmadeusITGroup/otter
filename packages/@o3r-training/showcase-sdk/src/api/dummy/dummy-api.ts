import type { Animal } from '../../models/base/animal/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, Server, selectServerBasePath, } from '@ama-sdk/core';
import { SDK_SERVERS } from '../../constants/servers';
/** Parameters object to DummyApi's animalGet function */
export interface DummyApiAnimalGetRequestData {
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
   * Animal get
   * Get an animal
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async animalGet(data: DummyApiAnimalGetRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<Animal> {
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
    const basePath = `${serverBasePath}/animal`;
    const tokenizedUrl = `${serverBasePath}/animal`;
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

    const ret = this.client.processCall<Animal>(url, options, ApiTypes.DEFAULT, DummyApi.apiName, undefined, 'animalGet');
    return ret;
  }

}
