import { Order } from '../../models/base/order/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, RequestBody, RequestMetadata } from '@ama-sdk/core';

export interface DeleteOrderRequestData {
  /** ID of the order that needs to be deleted */
  'orderId': number;
}
export interface GetInventoryRequestData {
}
export interface GetOrderByIdRequestData {
  /** ID of order that needs to be fetched */
  'orderId': number;
}
export interface PlaceOrderRequestData {
  /**  */
  'Order'?: Order;
}
/**
 * @Deprecated, please use DeleteOrderRequestData
 */
export interface DeleteOrder extends DeleteOrderRequestData {}

/**
 * @Deprecated, please use GetInventoryRequestData
 */
export interface GetInventory extends GetInventoryRequestData {}

/**
 * @Deprecated, please use GetOrderByIdRequestData
 */
export interface GetOrderById extends GetOrderByIdRequestData {}

/**
 * @Deprecated, please use PlaceOrderRequestData
 */
export interface PlaceOrder extends PlaceOrderRequestData {}

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
   * @params apiClient Client used to process call to the API
   */
  constructor(apiClient: ApiClient) {
    this.client = apiClient;
  }

  /**
   * Delete purchase order by ID
   * For valid response try integer IDs with value &lt; 1000. Anything above 1000 or nonintegers will generate API errors
   * @param data Data to provide to the API call
   */
  public async deleteOrder(data: DeleteOrderRequestData, metadata?: RequestMetadata<string, string>): Promise<never> {
    const getParams = this.client.extractQueryParams<DeleteOrderRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/store/order/${data.orderId}`;
    const tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens.orderId || data.orderId}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'DELETE', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<never>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'deleteOrder');
    return ret;
  }

  /**
   * Returns pet inventories by status
   * Returns a map of status codes to quantities
   * @param data Data to provide to the API call
   */
  public async getInventory(data: GetInventoryRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<{ [key: string]: number }> {
    const getParams = this.client.extractQueryParams<GetInventoryRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/store/inventory`;
    const tokenizedUrl = `${this.client.options.basePath}/store/inventory`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<{ [key: string]: number }>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'getInventory');
    return ret;
  }

  /**
   * Find purchase order by ID
   * For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.
   * @param data Data to provide to the API call
   */
  public async getOrderById(data: GetOrderByIdRequestData, metadata?: RequestMetadata<string, 'application/xml' | 'application/json'>): Promise<Order> {
    const getParams = this.client.extractQueryParams<GetOrderByIdRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    const body: RequestBody = '';
    const basePathUrl = `${this.client.options.basePath}/store/order/${data.orderId}`;
    const tokenizedUrl = `${this.client.options.basePath}/store/order/${this.piiParamTokens.orderId || data.orderId}`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'GET', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<Order>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'getOrderById');
    return ret;
  }

  /**
   * Place an order for a pet
   * Place a new order in the store
   * @param data Data to provide to the API call
   */
  public async placeOrder(data: PlaceOrderRequestData, metadata?: RequestMetadata<'application/json' | 'application/xml' | 'application/x-www-form-urlencoded', 'application/json'>): Promise<Order> {
    const getParams = this.client.extractQueryParams<PlaceOrderRequestData>(data, [] as never[]);
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = data.Order ? JSON.stringify(data.Order) : '{}';
    } else {
      body = data.Order as any;
    }
    const basePathUrl = `${this.client.options.basePath}/store/order`;
    const tokenizedUrl = `${this.client.options.basePath}/store/order`;
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, getParams, this.piiParamTokens, data);

    const options = await this.client.prepareOptions(basePathUrl, 'POST', getParams, headers, body || undefined, tokenizedOptions, metadata);
    const url = this.client.prepareUrl(options.basePath, options.queryParams);

    const ret = this.client.processCall<Order>(url, options, ApiTypes.DEFAULT, StoreApi.apiName, undefined, 'placeOrder');
    return ret;
  }

}
