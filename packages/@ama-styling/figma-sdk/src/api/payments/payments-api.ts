import { GetPayments200Response } from '../../models/base/get-payments200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to PaymentsApi's getPayments function */
export interface PaymentsApiGetPaymentsRequestData {
  /** Short-lived token returned from \"getPluginPaymentTokenAsync\" in the plugin payments API and used to authenticate to this endpoint. Read more about generating this token through \"Calling the Payments REST API from a plugin or widget\" below. */
  'plugin_payment_token'?: string;
  /** The ID of the user to query payment information about. You can get the user ID by having the user OAuth2 to the Figma REST API. */
  'user_id'?: string;
  /** The ID of the Community file to query a user's payment information on. You can get the Community file ID from the file's Community page (look for the number after \"file/\" in the URL). Provide exactly one of \"community_file_id\", \"plugin_id\", or \"widget_id\". */
  'community_file_id'?: string;
  /** The ID of the plugin to query a user's payment information on. You can get the plugin ID from the plugin's manifest, or from the plugin's Community page (look for the number after \"plugin/\" in the URL). Provide exactly one of \"community_file_id\", \"plugin_id\", or \"widget_id\". */
  'plugin_id'?: string;
  /** The ID of the widget to query a user's payment information on. You can get the widget ID from the widget's manifest, or from the widget's Community page (look for the number after \"widget/\" in the URL). Provide exactly one of \"community_file_id\", \"plugin_id\", or \"widget_id\". */
  'widget_id'?: string;
}
export class PaymentsApi implements Api {

  /** API name */
  public static readonly apiName = 'PaymentsApi';

  /** @inheritDoc */
  public readonly apiName = PaymentsApi.apiName;

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
   * Get payments
   * There are two methods to query for a user&#39;s payment information on a plugin, widget, or Community file. The first method, using plugin payment tokens, is typically used when making queries from a plugin&#39;s or widget&#39;s code. The second method, providing a user ID and resource ID, is typically used when making queries from anywhere else.  Note that you can only query for resources that you own. In most cases, this means that you can only query resources that you originally created.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getPayments(data: PaymentsApiGetPaymentsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetPayments200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['plugin_payment_token', 'user_id', 'community_file_id', 'plugin_id', 'widget_id']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { plugin_payment_token: { explode: true, style: 'form' }, user_id: { explode: true, style: 'form' }, community_file_id: { explode: true, style: 'form' }, plugin_id: { explode: true, style: 'form' }, widget_id: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
    }
    const basePath = `${this.client.options.basePath}/v1/payments`;
    const tokenizedUrl = `${this.client.options.basePath}/v1/payments`;
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

    const ret = this.client.processCall<GetPayments200Response>(url, options, ApiTypes.DEFAULT, PaymentsApi.apiName, undefined, 'getPayments');
    return ret;
  }

}
