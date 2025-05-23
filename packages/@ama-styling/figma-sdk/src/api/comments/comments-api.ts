import { Comment } from '../../models/base/comment/index';
import { DeleteComment200Response } from '../../models/base/delete-comment200-response/index';
import { GetComments200Response } from '../../models/base/get-comments200-response/index';
import { PostCommentRequest } from '../../models/base/post-comment-request/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens, isJsonMimeType, ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to CommentsApi's deleteComment function */
export interface CommentsApiDeleteCommentRequestData {
  /** File to delete comment from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** Comment id of comment to delete */
  'comment_id': string;
}
/** Parameters object to CommentsApi's getComments function */
export interface CommentsApiGetCommentsRequestData {
  /** File to get comments from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** If enabled, will return comments as their markdown equivalents when applicable. */
  'as_md'?: boolean;
}
/** Parameters object to CommentsApi's postComment function */
export interface CommentsApiPostCommentRequestData {
  /** File to add comments in. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** Comment to post. */
  'PostCommentRequest': PostCommentRequest;
}
export class CommentsApi implements Api {

  /** API name */
  public static readonly apiName = 'CommentsApi';

  /** @inheritDoc */
  public readonly apiName = CommentsApi.apiName;

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
   * Delete a comment
   * Deletes a specific comment. Only the person who made the comment is allowed to delete it.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async deleteComment(data: CommentsApiDeleteCommentRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<DeleteComment200Response> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key', 'comment_id']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' }, comment_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments/${serializedPathParams['comment_id']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments/${this.piiParamTokens['comment_id'] || serializedPathParams['comment_id']}`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments/${data['comment_id']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments/${this.piiParamTokens['comment_id'] || data['comment_id']}`;
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

    const ret = this.client.processCall<DeleteComment200Response>(url, options, ApiTypes.DEFAULT, CommentsApi.apiName, undefined, 'deleteComment');
    return ret;
  }

  /**
   * Get comments in a file
   * Gets a list of comments left on the file.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getComments(data: CommentsApiGetCommentsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetComments200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['as_md']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { as_md: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments`;
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

    const ret = this.client.processCall<GetComments200Response>(url, options, ApiTypes.DEFAULT, CommentsApi.apiName, undefined, 'getComments');
    return ret;
  }

  /**
   * Add a comment to a file
   * Posts a new comment on the file.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async postComment(data: CommentsApiPostCommentRequestData, metadata?: RequestMetadata<'application/json', 'application/json'>): Promise<Comment> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';
    if (headers['Content-Type'] && isJsonMimeType(headers['Content-Type'])) {
      body = typeof data['PostCommentRequest'] !== 'undefined' ? JSON.stringify(data['PostCommentRequest']) : '{}';
    } else {
      body = data['PostCommentRequest'] as any;
    }

    let queryParams = {};
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/comments`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/comments`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/comments`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/comments`;
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

    const ret = this.client.processCall<Comment>(url, options, ApiTypes.DEFAULT, CommentsApi.apiName, undefined, 'postComment');
    return ret;
  }

}
