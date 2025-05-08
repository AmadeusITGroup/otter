import { GetLibraryAnalyticsComponentActions200Response } from '../../models/base/get-library-analytics-component-actions200-response/index';
import { GetLibraryAnalyticsComponentUsages200Response } from '../../models/base/get-library-analytics-component-usages200-response/index';
import { GetLibraryAnalyticsStyleActions200Response } from '../../models/base/get-library-analytics-style-actions200-response/index';
import { GetLibraryAnalyticsStyleUsages200Response } from '../../models/base/get-library-analytics-style-usages200-response/index';
import { GetLibraryAnalyticsVariableActions200Response } from '../../models/base/get-library-analytics-variable-actions200-response/index';
import { GetLibraryAnalyticsVariableUsages200Response } from '../../models/base/get-library-analytics-variable-usages200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsComponentActions function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsGroupByEnum = 'component' | 'team';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsComponentUsages function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesGroupByEnum = 'component' | 'file';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsStyleActions function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsGroupByEnum = 'style' | 'team';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsStyleUsages function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesGroupByEnum = 'style' | 'file';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsVariableActions function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsGroupByEnum = 'variable' | 'team';

/** Enum groupBy used in the LibraryAnalyticsApi's getLibraryAnalyticsVariableUsages function parameter */
export type LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesGroupByEnum = 'variable' | 'file';

/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsComponentActions function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the nearest start of a week. Defaults to one year prior. */
  'start_date'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the nearest end of a week. Defaults to the latest computed week. */
  'end_date'?: string;
}
/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsComponentUsages function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
}
/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsStyleActions function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the nearest start of a week. Defaults to one year prior. */
  'start_date'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the nearest end of a week. Defaults to the latest computed week. */
  'end_date'?: string;
}
/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsStyleUsages function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
}
/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsVariableActions function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the nearest start of a week. Defaults to one year prior. */
  'start_date'?: string;
  /** ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the nearest end of a week. Defaults to the latest computed week. */
  'end_date'?: string;
}
/** Parameters object to LibraryAnalyticsApi's getLibraryAnalyticsVariableUsages function */
export interface LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesRequestData {
  /** File key of the library to fetch analytics data for. */
  'file_key': string;
  /** A dimension to group returned analytics data by. */
  'group_by': LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesGroupByEnum;
  /** Cursor indicating what page of data to fetch. Obtained from prior API call. */
  'cursor'?: string;
}
export class LibraryAnalyticsApi implements Api {

  /** API name */
  public static readonly apiName = 'LibraryAnalyticsApi';

  /** @inheritDoc */
  public readonly apiName = LibraryAnalyticsApi.apiName;

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
   * Get library analytics component action data.
   * Returns a list of library analytics component actions data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsComponentActions(data: LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsComponentActions200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by', 'start_date', 'end_date']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' }, start_date: { explode: true, style: 'form' }, end_date: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/component/actions`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/component/actions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/component/actions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/component/actions`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsComponentActions200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsComponentActions');
    return ret;
  }

  /**
   * Get library analytics component usage data.
   * Returns a list of library analytics component usage data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsComponentUsages(data: LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsComponentUsages200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/component/usages`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/component/usages`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/component/usages`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/component/usages`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsComponentUsages200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsComponentUsages');
    return ret;
  }

  /**
   * Get library analytics style action data.
   * Returns a list of library analytics style actions data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsStyleActions(data: LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsStyleActions200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by', 'start_date', 'end_date']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' }, start_date: { explode: true, style: 'form' }, end_date: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/style/actions`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/style/actions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/style/actions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/style/actions`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsStyleActions200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsStyleActions');
    return ret;
  }

  /**
   * Get library analytics style usage data.
   * Returns a list of library analytics style usage data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsStyleUsages(data: LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsStyleUsages200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/style/usages`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/style/usages`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/style/usages`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/style/usages`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsStyleUsages200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsStyleUsages');
    return ret;
  }

  /**
   * Get library analytics variable action data.
   * Returns a list of library analytics variable actions data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsVariableActions(data: LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsVariableActions200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by', 'start_date', 'end_date']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' }, start_date: { explode: true, style: 'form' }, end_date: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/variable/actions`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/variable/actions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/variable/actions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/variable/actions`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsVariableActions200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsVariableActions');
    return ret;
  }

  /**
   * Get library analytics variable usage data.
   * Returns a list of library analytics variable usage data broken down by the requested dimension.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getLibraryAnalyticsVariableUsages(data: LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetLibraryAnalyticsVariableUsages200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor', 'group_by']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' }, group_by: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${serializedPathParams['file_key']}/variable/usages`
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/variable/usages`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/analytics/libraries/${data['file_key']}/variable/usages`;
      tokenizedUrl = `${this.client.options.basePath}/v1/analytics/libraries/${this.piiParamTokens['file_key'] || data['file_key']}/variable/usages`;
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

    const ret = this.client.processCall<GetLibraryAnalyticsVariableUsages200Response>(url, options, ApiTypes.DEFAULT, LibraryAnalyticsApi.apiName, undefined, 'getLibraryAnalyticsVariableUsages');
    return ret;
  }

}
