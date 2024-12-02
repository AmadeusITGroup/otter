import {
  type Api,
  type ApiClient,
  ApiTypes,
  type RequestOptionsParameters,
  type ReviverType,
} from '../fwk';

/**
 * Generic request to the API
 */
export interface GenericRequestOptions<T> extends Omit<RequestOptionsParameters, 'api' | 'headers'> {
  /** API used to identify the call */
  api?: RequestOptionsParameters['api'];
  /** Custom headers to provide to the request */
  headers?: RequestOptionsParameters['headers'];
  /** Custom operation ID to identify the request */
  operationId?: string;
  /** Custom reviver to revive the response of the call */
  revivers?: ReviverType<T> | undefined | { [key: number]: ReviverType<T> | undefined };
}

/**
 * Generic request to the API
 */
export class GenericApi implements Api {
  /** API name */
  public static readonly apiName = 'GenericApi';

  /** @inheritDoc */
  public readonly apiName = GenericApi.apiName;

  /** @inheritDoc */
  public client: ApiClient;

  /**
   * Initialize your interface
   * @param apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Process to request to the API in the context of the SDK
   * @param requestOptions Option to provide to process to the call
   */
  public async request<T>(requestOptions: GenericRequestOptions<T>): Promise<T> {
    const metadataHeaderAccept = requestOptions.metadata?.headerAccept || 'application/json';
    const headers = {
      'Content-Type': requestOptions.metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? { Accept: metadataHeaderAccept } : {})
    } as const satisfies RequestOptionsParameters['headers'];

    const requestParameters = {
      api: this,
      headers,
      ...requestOptions
    } as const satisfies RequestOptionsParameters;
    const options = await this.client.getRequestOptions(requestParameters);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<T>(url, options, ApiTypes.DEFAULT, requestOptions.api!.apiName, requestOptions.revivers, requestOptions.operationId);
    return ret;
  }
}
