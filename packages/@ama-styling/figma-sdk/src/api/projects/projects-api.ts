import { GetProjectFiles200Response } from '../../models/base/get-project-files200-response/index';
import { GetTeamProjects200Response } from '../../models/base/get-team-projects200-response/index';
import { Api, ApiClient, ApiTypes, computePiiParameterTokens,  ParamSerializationOptions, RequestBody, RequestMetadata, } from '@ama-sdk/core';

/** Parameters object to ProjectsApi's getProjectFiles function */
export interface ProjectsApiGetProjectFilesRequestData {
  /** ID of the project to list files from */
  'project_id': string;
  /** Returns branch metadata in the response for each main file with a branch inside the project. */
  'branch_data'?: boolean;
}
/** Parameters object to ProjectsApi's getTeamProjects function */
export interface ProjectsApiGetTeamProjectsRequestData {
  /** ID of the team to list projects from */
  'team_id': string;
}
export class ProjectsApi implements Api {

  /** API name */
  public static readonly apiName = 'ProjectsApi';

  /** @inheritDoc */
  public readonly apiName = ProjectsApi.apiName;

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
   * Get files in a project
   * Get a list of all the Files within the specified project.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getProjectFiles(data: ProjectsApiGetProjectFilesRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetProjectFiles200Response> {
    data['branch_data'] = data['branch_data'] !== undefined ? data['branch_data'] : false;
    const metadataHeaderAccept = metadata?.headerAccept || 'application/json';
    const headers: { [key: string]: string | undefined } = {
      'Content-Type': metadata?.headerContentType || 'application/json',
      ...(metadataHeaderAccept ? {'Accept': metadataHeaderAccept} : {})
    };

    let body: RequestBody = '';

    let queryParams = {};
    const queryParamsProperties = this.client.getPropertiesFromData(data, ['branch_data']);
    const paramSerializationOptions: ParamSerializationOptions = {
      enableParameterSerialization: this.client.options.enableParameterSerialization
    };
    let basePath;
    let tokenizedUrl;
    if (this.client.options.enableParameterSerialization) {
      const queryParamSerialization = { branch_data: { explode: true, style: 'form' } };
      queryParams = this.client.serializeQueryParams(queryParamsProperties, queryParamSerialization);
      paramSerializationOptions.queryParamSerialization = queryParamSerialization;
      const pathParamsProperties = this.client.getPropertiesFromData(data, ['project_id']);
      const pathParamSerialization = { project_id: { explode: false, style: 'simple' } }
      const serializedPathParams = this.client.serializePathParams(pathParamsProperties, pathParamSerialization);
      basePath = `${this.client.options.basePath}/v1/projects/${serializedPathParams['project_id']}/files`
      tokenizedUrl = `${this.client.options.basePath}/v1/projects/${this.piiParamTokens['project_id'] || serializedPathParams['project_id']}/files`
    } else {
      queryParams = this.client.stringifyQueryParams(queryParamsProperties);
      basePath = `${this.client.options.basePath}/v1/projects/${data['project_id']}/files`;
      tokenizedUrl = `${this.client.options.basePath}/v1/projects/${this.piiParamTokens['project_id'] || data['project_id']}/files`;
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

    const ret = this.client.processCall<GetProjectFiles200Response>(url, options, ApiTypes.DEFAULT, ProjectsApi.apiName, undefined, 'getProjectFiles');
    return ret;
  }

  /**
   * Get projects in a team
   * You can use this endpoint to get a list of all the Projects within the specified team. This will only return projects visible to the authenticated user or owner of the developer token. Note: it is not currently possible to programmatically obtain the team id of a user just from a token. To obtain a team id, navigate to a team page of a team you are a part of. The team id will be present in the URL after the word team and before your team name.
   * @param data Data to provide to the API call
   * @param metadata Metadata to pass to the API call
   */
  public async getTeamProjects(data: ProjectsApiGetTeamProjectsRequestData, metadata?: RequestMetadata<string, 'application/json'>): Promise<GetTeamProjects200Response> {
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
      basePath = `${this.client.options.basePath}/v1/teams/${serializedPathParams['team_id']}/projects`
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || serializedPathParams['team_id']}/projects`
    } else {
      basePath = `${this.client.options.basePath}/v1/teams/${data['team_id']}/projects`;
      tokenizedUrl = `${this.client.options.basePath}/v1/teams/${this.piiParamTokens['team_id'] || data['team_id']}/projects`;
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

    const ret = this.client.processCall<GetTeamProjects200Response>(url, options, ApiTypes.DEFAULT, ProjectsApi.apiName, undefined, 'getTeamProjects');
    return ret;
  }

}
