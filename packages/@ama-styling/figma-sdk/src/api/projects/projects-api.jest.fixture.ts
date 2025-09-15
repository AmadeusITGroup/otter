import { GetProjectFiles200Response } from '../../models/base/get-project-files200-response/index';
import { GetTeamProjects200Response } from '../../models/base/get-team-projects200-response/index';

import { ProjectsApi, ProjectsApiGetProjectFilesRequestData, ProjectsApiGetTeamProjectsRequestData } from './projects-api';

export class ProjectsApiFixture implements Partial<Readonly<ProjectsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ProjectsApi';

    /**
   * Fixture associated to function getProjectFiles
   */
  public getProjectFiles: jest.Mock<Promise<GetProjectFiles200Response>, [ProjectsApiGetProjectFilesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getTeamProjects
   */
  public getTeamProjects: jest.Mock<Promise<GetTeamProjects200Response>, [ProjectsApiGetTeamProjectsRequestData]> = jest.fn();
}

