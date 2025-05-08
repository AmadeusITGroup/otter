import { GetTeamWebhooks200Response } from '../../models/base/get-team-webhooks200-response/index';
import { GetWebhookRequests200Response } from '../../models/base/get-webhook-requests200-response/index';
import { PostWebhookRequest } from '../../models/base/post-webhook-request/index';
import { PutWebhookRequest } from '../../models/base/put-webhook-request/index';
import { WebhookV2 } from '../../models/base/webhook-v2/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to WebhooksApi's deleteWebhook function */
export interface WebhooksApiDeleteWebhookRequestData {
  /** ID of webhook to delete */
  'webhook_id': string;
}
/** Parameters object to WebhooksApi's getTeamWebhooks function */
export interface WebhooksApiGetTeamWebhooksRequestData {
  /** ID of team to get webhooks for */
  'team_id': string;
}
/** Parameters object to WebhooksApi's getWebhook function */
export interface WebhooksApiGetWebhookRequestData {
  /** ID of webhook to get */
  'webhook_id': string;
}
/** Parameters object to WebhooksApi's getWebhookRequests function */
export interface WebhooksApiGetWebhookRequestsRequestData {
  /** The id of the webhook subscription you want to see events from */
  'webhook_id': string;
}
/** Parameters object to WebhooksApi's postWebhook function */
export interface WebhooksApiPostWebhookRequestData {
  /** The webhook to create. */
  'PostWebhookRequest': PostWebhookRequest;
}
/** Parameters object to WebhooksApi's putWebhook function */
export interface WebhooksApiPutWebhookRequestData {
  /** ID of webhook to update */
  'webhook_id': string;
  /** The webhook to update. */
  'PutWebhookRequest': PutWebhookRequest;
}
export class WebhooksApi implements Api {

  /** API name */
  public static readonly apiName = 'WebhooksApi';

  /** @inheritDoc */
  public readonly apiName = WebhooksApi.apiName;

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
   * Delete a webhook
   * Deletes the specified webhook. This operation cannot be reversed.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteWebhook(data: WebhooksApiDeleteWebhookRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<WebhookV2> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['webhook_id']);
      const pathParamSerialization = { webhook_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v2/webhooks/${serializedPathParams['webhook_id']}`
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || serializedPathParams['webhook_id']}`
    } else {
      basePath = `${this.client.options.basePath}/v2/webhooks/${data['webhook_id']}`;
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || data['webhook_id']}`;
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

    const ret = this.client.processCall<WebhookV2>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'deleteWebhook');
    return ret;
  }

  /**
   * Get team webhooks
   * Returns all webhooks registered under the specified team.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getTeamWebhooks(data: WebhooksApiGetTeamWebhooksRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetTeamWebhooks200Response> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['team_id']);
      const pathParamSerialization = { team_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v2/teams/${serializedPathParams['team_id']}/webhooks`
      tokenizedUrl = `${this.client.options.basePath}/v2/teams/${this.piiParamTokens['team_id'] || serializedPathParams['team_id']}/webhooks`
    } else {
      basePath = `${this.client.options.basePath}/v2/teams/${data['team_id']}/webhooks`;
      tokenizedUrl = `${this.client.options.basePath}/v2/teams/${this.piiParamTokens['team_id'] || data['team_id']}/webhooks`;
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

    const ret = this.client.processCall<GetTeamWebhooks200Response>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'getTeamWebhooks');
    return ret;
  }

  /**
   * Get a webhook
   * Get a webhook by ID.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getWebhook(data: WebhooksApiGetWebhookRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<WebhookV2> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['webhook_id']);
      const pathParamSerialization = { webhook_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v2/webhooks/${serializedPathParams['webhook_id']}`
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || serializedPathParams['webhook_id']}`
    } else {
      basePath = `${this.client.options.basePath}/v2/webhooks/${data['webhook_id']}`;
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || data['webhook_id']}`;
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

    const ret = this.client.processCall<WebhookV2>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'getWebhook');
    return ret;
  }

  /**
   * Get webhook requests
   * Returns all webhook requests sent within the last week. Useful for debugging.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getWebhookRequests(data: WebhooksApiGetWebhookRequestsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetWebhookRequests200Response> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['webhook_id']);
      const pathParamSerialization = { webhook_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v2/webhooks/${serializedPathParams['webhook_id']}/requests`
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || serializedPathParams['webhook_id']}/requests`
    } else {
      basePath = `${this.client.options.basePath}/v2/webhooks/${data['webhook_id']}/requests`;
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || data['webhook_id']}/requests`;
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

    const ret = this.client.processCall<GetWebhookRequests200Response>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'getWebhookRequests');
    return ret;
  }

  /**
   * Create a webhook
   * Create a new webhook which will call the specified endpoint when the event triggers. By default, this webhook will automatically send a PING event to the endpoint when it is created. If this behavior is not desired, you can create the webhook and set the status to PAUSED and reactivate it later.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async postWebhook(data: WebhooksApiPostWebhookRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<WebhookV2> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PostWebhookRequest'] !== 'undefined' ? JSON.stringify(data['PostWebhookRequest']) : '{}';
    } else {
      body = data['PostWebhookRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    const basePath = `${this.client.options.basePath}/v2/webhooks`;
    const tokenizedUrl = `${this.client.options.basePath}/v2/webhooks`;
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

    const ret = this.client.processCall<WebhookV2>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'postWebhook');
    return ret;
  }

  /**
   * Update a webhook
   * Update a webhook by ID.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async putWebhook(data: WebhooksApiPutWebhookRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<WebhookV2> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PutWebhookRequest'] !== 'undefined' ? JSON.stringify(data['PutWebhookRequest']) : '{}';
    } else {
      body = data['PutWebhookRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['webhook_id']);
      const pathParamSerialization = { webhook_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v2/webhooks/${serializedPathParams['webhook_id']}`
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || serializedPathParams['webhook_id']}`
    } else {
      basePath = `${this.client.options.basePath}/v2/webhooks/${data['webhook_id']}`;
      tokenizedUrl = `${this.client.options.basePath}/v2/webhooks/${this.piiParamTokens['webhook_id'] || data['webhook_id']}`;
    }
    const tokenizedOptions = this.client.tokenizeRequestOptions(tokenizedUrl, queryParams, this.piiParamTokens, data);

    const requestOptions = {
      headers,
      method: 'PUT',
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

    const ret = this.client.processCall<WebhookV2>(url, options, ApiTypes.DEFAULT, WebhooksApi.apiName, undefined, 'putWebhook');
    return ret;
  }

}
