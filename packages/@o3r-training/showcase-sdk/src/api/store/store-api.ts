import { Order } from '../../models/base/order/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to StoreApi's deleteOrder function */
export interface StoreApiDeleteOrderRequestData {
  /** ID of the order that needs to be deleted */
  'orderId': number;
}
/** Parameters object to StoreApi's getInventory function */
export interface StoreApiGetInventoryRequestData {
}
/** Parameters object to StoreApi's getOrderById function */
export interface StoreApiGetOrderByIdRequestData {
  /** ID of order that needs to be fetched */
  'orderId': number;
}
/** Parameters object to StoreApi's placeOrder function */
export interface StoreApiPlaceOrderRequestData {
  /**  */
  'Order'?: Order;
}
export class StoreApi implements Api {

  /** API name */
  public static readonly apiName = 'StoreApi';

  /** @inheritDoc */
  public readonly apiName = StoreApi.apiName;

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
   * Delete purchase order by ID
   * For valid response try integer IDs with value &lt; 1000. Anything above 1000 or nonintegers will generate API errors
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteOrder(data: StoreApiDeleteOrderRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
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
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['orderId']);
      const pathParamSerialization = { orderId: { explode: false, style: 'simple' } };
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/store/order/${serializedPathParams['orderId']}`;
      tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens['orderId'] || serializedPathParams['orderId']}`;
    } else {
      basePath = `${this.client.options.basePath}/store/order/${data['orderId']}`;
      tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens['orderId'] || data['orderId']}`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'DELETE',
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

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'deleteOrder');
    return ret;
  }

  /**
   * Returns pet inventories by status
   * Returns a map of status codes to quantities
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getInventory(data: StoreApiGetInventoryRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<{ [key: string]: number; }> {
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
    const basePath = `${this.client.options.basePath}/store/inventory`;
    const tokenizedUrl = `${this.client.options.basePath}/store/inventory`;
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

    const ret = this.client.processCall<{ [key: string]: number; }>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'getInventory');
    return ret;
  }

  /**
   * Find purchase order by ID
   * For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getOrderById(data: StoreApiGetOrderByIdRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<Order> {
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
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['orderId']);
      const pathParamSerialization = { orderId: { explode: false, style: 'simple' } };
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/store/order/${serializedPathParams['orderId']}`;
      tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens['orderId'] || serializedPathParams['orderId']}`;
    } else {
      basePath = `${this.client.options.basePath}/store/order/${data['orderId']}`;
      tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens['orderId'] || data['orderId']}`;
    }
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

    const ret = this.client.processCall<Order>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'getOrderById');
    return ret;
  }

  /**
   * Place an order for a pet
   * Place a new order in the store
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async placeOrder(data: StoreApiPlaceOrderRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/json'>): Promise<Order> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['Order'] !== 'undefined' ? JSON.stringify(data['Order']) : '{}';
    } else {
      body = data['Order'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/store/order`;
    const tokenizedUrl = `${this.client.options.basePath}/store/order`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'POST',
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

    const ret = this.client.processCall<Order>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'placeOrder');
    return ret;
  }

}
