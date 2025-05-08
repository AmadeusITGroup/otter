import { GetActivityLogs200Response } from '../../models/base/get-activity-logs200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Enum order used in the ActivityLogsApi's getActivityLogs function parameter */
export type ActivityLogsApiGetActivityLogsOrderEnum = 'asc' | 'desc';

/** Parameters object to ActivityLogsApi's getActivityLogs function */
export interface ActivityLogsApiGetActivityLogsRequestData {
  /** Event type(s) to include in the response. Can have multiple values separated by comma. All events are returned by default. */
  'events'?: string;
  /** Unix timestamp of the least recent event to include. This param defaults to one year ago if unspecified. */
  'start_time'?: number;
  /** Unix timestamp of the most recent event to include. This param defaults to the current timestamp if unspecified. */
  'end_time'?: number;
  /** Maximum number of events to return. This param defaults to 1000 if unspecified. */
  'limit'?: number;
  /** Event order by timestamp. This param can be either \"asc\" (default) or \"desc\". */
  'order'?: ActivityLogsApiGetActivityLogsOrderEnum;
}
export class ActivityLogsApi implements Api {

  /** API name */
  public static readonly apiName = 'ActivityLogsApi';

  /** @inheritDoc */
  public readonly apiName = ActivityLogsApi.apiName;

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
   * Get activity logs
   * Returns a list of activity log events
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getActivityLogs(data: ActivityLogsApiGetActivityLogsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetActivityLogs200Response> {
    data['order'] = data['order'] !== undefined ? data['order'] : 'asc';
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['events', 'start_time', 'end_time', 'limit', 'order']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { events: { explode: true, style: 'form' }, start_time: { explode: true, style: 'form' }, end_time: { explode: true, style: 'form' }, limit: { explode: true, style: 'form' }, order: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
    }
    const basePath = `${this.client.options.basePath}/v1/activity_logs`;
    const tokenizedUrl = `${this.client.options.basePath}/v1/activity_logs`;
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

    const ret = this.client.processCall<GetActivityLogs200Response>(url, options, ApiTypes.DEFAULT, ActivityLogsApi.apiName, undefined, 'getActivityLogs');
    return ret;
  }

}
