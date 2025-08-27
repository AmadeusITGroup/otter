import { DeleteComment200Response } from '../../models/base/delete-comment200-response/index';
import { GetCommentReactions200Response } from '../../models/base/get-comment-reactions200-response/index';
import { PostCommentReactionRequest } from '../../models/base/post-comment-reaction-request/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to CommentReactionsApi's deleteCommentReaction function */
export interface CommentReactionsApiDeleteCommentReactionRequestData {
  /** File to delete comment reaction from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** ID of comment to delete reaction from. */
  'comment_id': string;
  /**  */
  'emoji': string;
}
/** Parameters object to CommentReactionsApi's getCommentReactions function */
export interface CommentReactionsApiGetCommentReactionsRequestData {
  /** File to get comment containing reactions from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** ID of comment to get reactions from. */
  'comment_id': string;
  /** Cursor for pagination, retrieved from the response of the previous call. */
  'cursor'?: string;
}
/** Parameters object to CommentReactionsApi's postCommentReaction function */
export interface CommentReactionsApiPostCommentReactionRequestData {
  /** File to post comment reactions to. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** ID of comment to react to. */
  'comment_id': string;
  /** Reaction to post. */
  'PostCommentReactionRequest': PostCommentReactionRequest;
}
export class CommentReactionsApi implements Api {

  /** API name */
  public static readonly apiName = 'CommentReactionsApi';

  /** @inheritDoc */
  public readonly apiName = CommentReactionsApi.apiName;

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
   * Delete a reaction
   * Deletes a specific comment reaction. Only the person who made the reaction is allowed to delete it.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteCommentReaction(data: CommentReactionsApiDeleteCommentReactionRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<DeleteComment200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['emoji']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { emoji: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key', 'comment_id']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' }, comment_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments/${serializedPathParams['comment_id']}/reactions`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments/${this.piiParamTokens['comment_id'] || serializedPathParams['comment_id']}/reactions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments/${data['comment_id']}/reactions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments/${this.piiParamTokens['comment_id'] || data['comment_id']}/reactions`;
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

    const ret = this.client.processCall<DeleteComment200Response>(url, options, ApiTypes.DEFAULT, CommentReactionsApi.apiName, undefined, 'deleteCommentReaction');
    return ret;
  }

  /**
   * Get reactions for a comment
   * Gets a paginated list of reactions left on the comment.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getCommentReactions(data: CommentReactionsApiGetCommentReactionsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetCommentReactions200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['cursor']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { cursor: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key', 'comment_id']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' }, comment_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments/${serializedPathParams['comment_id']}/reactions`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments/${this.piiParamTokens['comment_id'] || serializedPathParams['comment_id']}/reactions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments/${data['comment_id']}/reactions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments/${this.piiParamTokens['comment_id'] || data['comment_id']}/reactions`;
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

    const ret = this.client.processCall<GetCommentReactions200Response>(url, options, ApiTypes.DEFAULT, CommentReactionsApi.apiName, undefined, 'getCommentReactions');
    return ret;
  }

  /**
   * Add a reaction to a comment
   * Posts a new comment reaction on a file comment.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async postCommentReaction(data: CommentReactionsApiPostCommentReactionRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<DeleteComment200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PostCommentReactionRequest'] !== 'undefined' ? JSON.stringify(data['PostCommentReactionRequest']) : '{}';
    } else {
      body = data['PostCommentReactionRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key', 'comment_id']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' }, comment_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments/${serializedPathParams['comment_id']}/reactions`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments/${this.piiParamTokens['comment_id'] || serializedPathParams['comment_id']}/reactions`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments/${data['comment_id']}/reactions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments/${this.piiParamTokens['comment_id'] || data['comment_id']}/reactions`;
    }
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

    const ret = this.client.processCall<DeleteComment200Response>(url, options, ApiTypes.DEFAULT, CommentReactionsApi.apiName, undefined, 'postCommentReaction');
    return ret;
  }

}
