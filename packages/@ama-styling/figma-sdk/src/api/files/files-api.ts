import { GetFile200Response } from '../../models/base/get-file200-response/index';
import { GetFileMeta200Response } from '../../models/base/get-file-meta200-response/index';
import { GetFileNodes200Response } from '../../models/base/get-file-nodes200-response/index';
import { GetFileVersions200Response } from '../../models/base/get-file-versions200-response/index';
import { GetImageFills200Response } from '../../models/base/get-image-fills200-response/index';
import { GetImages200Response } from '../../models/base/get-images200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Enum format used in the FilesApi's getImages function parameter */
export type FilesApiGetImagesFormatEnum = 'jpg' | 'png' | 'svg' | 'pdf';

/** Parameters object to FilesApi's getFile function */
export interface FilesApiGetFileRequestData {
  /** File to export JSON from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** A specific version ID to get. Omitting this will get the current version of the file. */
  'version'?: string;
  /** Comma separated list of nodes that you care about in the document. If specified, only a subset of the document will be returned corresponding to the nodes listed, their children, and everything between the root node and the listed nodes.  Note: There may be other nodes included in the returned JSON that are outside the ancestor chains of the desired nodes. The response may also include dependencies of anything in the nodes' subtrees. For example, if a node subtree contains an instance of a local component that lives elsewhere in that file, that component and its ancestor chain will also be included.  For historical reasons, top-level canvas nodes are always returned, regardless of whether they are listed in the `ids` parameter. This quirk may be removed in a future version of the API. */
  'ids'?: string;
  /** Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes. */
  'depth'?: number;
  /** Set to \"paths\" to export vector data. */
  'geometry'?: string;
  /** A comma separated list of plugin IDs and/or the string \"shared\". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  'plugin_data'?: string;
  /** Returns branch metadata for the requested file. If the file is a branch, the main file's key will be included in the returned response. If the file has branches, their metadata will be included in the returned response. Default: false. */
  'branch_data'?: boolean;
}
/** Parameters object to FilesApi's getFileMeta function */
export interface FilesApiGetFileMetaRequestData {
  /** File to get metadata for. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
}
/** Parameters object to FilesApi's getFileNodes function */
export interface FilesApiGetFileNodesRequestData {
  /** File to export JSON from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** A comma separated list of node IDs to retrieve and convert. */
  'ids': string;
  /** A specific version ID to get. Omitting this will get the current version of the file. */
  'version'?: string;
  /** Positive integer representing how deep into the node tree to traverse. For example, setting this to 1 will return only the children directly underneath the desired nodes. Not setting this parameter returns all nodes.  Note: this parameter behaves differently from the same parameter in the `GET /v1/files/:key` endpoint. In this endpoint, the depth will be counted starting from the desired node rather than the document root node. */
  'depth'?: number;
  /** Set to \"paths\" to export vector data. */
  'geometry'?: string;
  /** A comma separated list of plugin IDs and/or the string \"shared\". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  'plugin_data'?: string;
}
/** Parameters object to FilesApi's getFileVersions function */
export interface FilesApiGetFileVersionsRequestData {
  /** File to get version history from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** The number of items returned in a page of the response. If not included, `page_size` is `30`. */
  'page_size'?: number;
  /** A version ID for one of the versions in the history. Gets versions before this ID. Used for paginating. If the response is not paginated, this link returns the same data in the current response. */
  'before'?: number;
  /** A version ID for one of the versions in the history. Gets versions after this ID. Used for paginating. If the response is not paginated, this property is not included. */
  'after'?: number;
}
/** Parameters object to FilesApi's getImageFills function */
export interface FilesApiGetImageFillsRequestData {
  /** File to get image URLs from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
}
/** Parameters object to FilesApi's getImages function */
export interface FilesApiGetImagesRequestData {
  /** File to export images from. This can be a file key or branch key. Use `GET /v1/files/:key` with the `branch_data` query param to get the branch key. */
  'file_key': string;
  /** A comma separated list of node IDs to render. */
  'ids': string;
  /** A specific version ID to get. Omitting this will get the current version of the file. */
  'version'?: string;
  /** A number between 0.01 and 4, the image scaling factor. */
  'scale'?: number;
  /** A string enum for the image output format. */
  'format'?: FilesApiGetImagesFormatEnum;
  /** Whether text elements are rendered as outlines (vector paths) or as `<text>` elements in SVGs.  Rendering text elements as outlines guarantees that the text looks exactly the same in the SVG as it does in the browser/inside Figma.  Exporting as `<text>` allows text to be selectable inside SVGs and generally makes the SVG easier to read. However, this relies on the browser's rendering engine which can vary between browsers and/or operating systems. As such, visual accuracy is not guaranteed as the result could look different than in Figma. */
  'svg_outline_text'?: boolean;
  /** Whether to include id attributes for all SVG elements. Adds the layer name to the `id` attribute of an svg element. */
  'svg_include_id'?: boolean;
  /** Whether to include node id attributes for all SVG elements. Adds the node id to a `data-node-id` attribute of an svg element. */
  'svg_include_node_id'?: boolean;
  /** Whether to simplify inside/outside strokes and use stroke attribute if possible instead of `<mask>`. */
  'svg_simplify_stroke'?: boolean;
  /** Whether content that overlaps the node should be excluded from rendering. Passing false (i.e., rendering overlaps) may increase processing time, since more of the document must be included in rendering. */
  'contents_only'?: boolean;
  /** Use the full dimensions of the node regardless of whether or not it is cropped or the space around it is empty. Use this to export text nodes without cropping. */
  'use_absolute_bounds'?: boolean;
}
export class FilesApi implements Api {

  /** API name */
  public static readonly apiName = 'FilesApi';

  /** @inheritDoc */
  public readonly apiName = FilesApi.apiName;

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
   * Get file JSON
   * Returns the document identified by &#x60;file_key&#x60; as a JSON object. The file key can be parsed from any Figma file url: &#x60;https://www.figma.com/file/{file_key}/{title}&#x60;.  The &#x60;document&#x60; property contains a node of type &#x60;DOCUMENT&#x60;.  The &#x60;components&#x60; property contains a mapping from node IDs to component metadata. This is to help you determine which components each instance comes from.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFile(data: FilesApiGetFileRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFile200Response> {
    data['branch_data'] = data['branch_data'] !== undefined ? data['branch_data'] : false;
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['version', 'ids', 'depth', 'geometry', 'plugin_data', 'branch_data']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { version: { explode: true, style: 'form' }, ids: { explode: true, style: 'form' }, depth: { explode: true, style: 'form' }, geometry: { explode: true, style: 'form' }, plugin_data: { explode: true, style: 'form' }, branch_data: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}`;
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

    const ret = this.client.processCall<GetFile200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getFile');
    return ret;
  }

  /**
   * Get file metadata
   * Get file metadata
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileMeta(data: FilesApiGetFileMetaRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileMeta200Response> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/meta`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/meta`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/meta`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/meta`;
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

    const ret = this.client.processCall<GetFileMeta200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getFileMeta');
    return ret;
  }

  /**
   * Get file JSON for specific nodes
   * Returns the nodes referenced to by &#x60;ids&#x60; as a JSON object. The nodes are retrieved from the Figma file referenced to by &#x60;file_key&#x60;.  The node ID and file key can be parsed from any Figma node url: &#x60;https://www.figma.com/file/{file_key}/{title}?node-id&#x3D;{id}&#x60;  The &#x60;name&#x60;, &#x60;lastModified&#x60;, &#x60;thumbnailUrl&#x60;, &#x60;editorType&#x60;, and &#x60;version&#x60; attributes are all metadata of the specified file.  The &#x60;linkAccess&#x60; field describes the file link share permission level. There are 5 types of permissions a shared link can have: &#x60;\&quot;inherit\&quot;&#x60;, &#x60;\&quot;view\&quot;&#x60;, &#x60;\&quot;edit\&quot;&#x60;, &#x60;\&quot;org_view\&quot;&#x60;, and &#x60;\&quot;org_edit\&quot;&#x60;. &#x60;\&quot;inherit\&quot;&#x60; is the default permission applied to files created in a team project, and will inherit the project&#39;s permissions. &#x60;\&quot;org_view\&quot;&#x60; and &#x60;\&quot;org_edit\&quot;&#x60; restrict the link to org users.  The &#x60;document&#x60; attribute contains a Node of type &#x60;DOCUMENT&#x60;.  The &#x60;components&#x60; key contains a mapping from node IDs to component metadata. This is to help you determine which components each instance comes from.  By default, no vector data is returned. To return vector data, pass the geometry&#x3D;paths parameter to the endpoint. Each node can also inherit properties from applicable styles. The styles key contains a mapping from style IDs to style metadata.  Important: the nodes map may contain values that are &#x60;null&#x60;. This may be due to the node id not existing within the specified file.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileNodes(data: FilesApiGetFileNodesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileNodes200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['ids', 'version', 'depth', 'geometry', 'plugin_data']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { ids: { explode: true, style: 'form' }, version: { explode: true, style: 'form' }, depth: { explode: true, style: 'form' }, geometry: { explode: true, style: 'form' }, plugin_data: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/nodes`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/nodes`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/nodes`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/nodes`;
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

    const ret = this.client.processCall<GetFileNodes200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getFileNodes');
    return ret;
  }

  /**
   * Get versions of a file
   * This endpoint fetches the version history of a file, allowing you to see the progression of a file over time. You can then use this information to render a specific version of the file, via another endpoint.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getFileVersions(data: FilesApiGetFileVersionsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetFileVersions200Response> {
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['page_size', 'before', 'after']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { page_size: { explode: true, style: 'form' }, before: { explode: true, style: 'form' }, after: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/versions`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/versions`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/versions`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/versions`;
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

    const ret = this.client.processCall<GetFileVersions200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getFileVersions');
    return ret;
  }

  /**
   * Get image fills
   * Returns download links for all images present in image fills in a document. Image fills are how Figma represents any user supplied images. When you drag an image into Figma, we create a rectangle with a single fill that represents the image, and the user is able to transform the rectangle (and properties on the fill) as they wish.  This endpoint returns a mapping from image references to the URLs at which the images may be download. Image URLs will expire after no more than 14 days. Image references are located in the output of the GET files endpoint under the &#x60;imageRef&#x60; attribute in a &#x60;Paint&#x60;.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getImageFills(data: FilesApiGetImageFillsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetImageFills200Response> {
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
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/files/${serializedPathParams['file_key']}/images`
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}/images`
    } else {
      basePath = `${this.client.options.basePath}/v1/files/${data['file_key']}/images`;
      tokenizedUrl = `${this.client.options.basePath}/v1/files/${this.piiParamTokens['file_key'] || data['file_key']}/images`;
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

    const ret = this.client.processCall<GetImageFills200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getImageFills');
    return ret;
  }

  /**
   * Render images of file nodes
   * Renders images from a file.  If no error occurs, &#x60;\&quot;images\&quot;&#x60; will be populated with a map from node IDs to URLs of the rendered images, and &#x60;\&quot;status\&quot;&#x60; will be omitted. The image assets will expire after 30 days. Images up to 32 megapixels can be exported. Any images that are larger will be scaled down.  Important: the image map may contain values that are &#x60;null&#x60;. This indicates that rendering of that specific node has failed. This may be due to the node id not existing, or other reasons such has the node having no renderable components. It is guaranteed that any node that was requested for rendering will be represented in this map whether or not the render succeeded.  To render multiple images from the same file, use the &#x60;ids&#x60; query parameter to specify multiple node ids.  &#x60;&#x60;&#x60; GET /v1/images/:key?ids&#x3D;1:2,1:3,1:4 &#x60;&#x60;&#x60; 
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getImages(data: FilesApiGetImagesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetImages200Response> {
    data['format'] = data['format'] !== undefined ? data['format'] : 'png';
    data['svg_outline_text'] = data['svg_outline_text'] !== undefined ? data['svg_outline_text'] : true;
    data['svg_include_id'] = data['svg_include_id'] !== undefined ? data['svg_include_id'] : false;
    data['svg_include_node_id'] = data['svg_include_node_id'] !== undefined ? data['svg_include_node_id'] : false;
    data['svg_simplify_stroke'] = data['svg_simplify_stroke'] !== undefined ? data['svg_simplify_stroke'] : true;
    data['contents_only'] = data['contents_only'] !== undefined ? data['contents_only'] : true;
    data['use_absolute_bounds'] = data['use_absolute_bounds'] !== undefined ? data['use_absolute_bounds'] : false;
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['ids', 'version', 'scale', 'format', 'svg_outline_text', 'svg_include_id', 'svg_include_node_id', 'svg_simplify_stroke', 'contents_only', 'use_absolute_bounds']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { ids: { explode: true, style: 'form' }, version: { explode: true, style: 'form' }, scale: { explode: true, style: 'form' }, format: { explode: true, style: 'form' }, svg_outline_text: { explode: true, style: 'form' }, svg_include_id: { explode: true, style: 'form' }, svg_include_node_id: { explode: true, style: 'form' }, svg_simplify_stroke: { explode: true, style: 'form' }, contents_only: { explode: true, style: 'form' }, use_absolute_bounds: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['file_key']);
      const pathParamSerialization = { file_key: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/images/${serializedPathParams['file_key']}`
      tokenizedUrl = `${this.client.options.basePath}/v1/images/${this.piiParamTokens['file_key'] || serializedPathParams['file_key']}`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/images/${data['file_key']}`;
      tokenizedUrl = `${this.client.options.basePath}/v1/images/${this.piiParamTokens['file_key'] || data['file_key']}`;
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

    const ret = this.client.processCall<GetImages200Response>(url, options, ApiTypes.DEFAULT, FilesApi.apiName, undefined, 'getImages');
    return ret;
  }

}
