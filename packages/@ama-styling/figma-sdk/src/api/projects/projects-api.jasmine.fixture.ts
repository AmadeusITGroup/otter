import { ProjectsApi } from './projects-api';

export class ProjectsApiFixture implements Partial<Readonly<ProjectsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ProjectsApi';

    /**
   * Fixture associated to function getProjectFiles
   */
  public getProjectFiles: jasmine.Spy = jasmine.createSpy('getProjectFiles');
  /**
   * Fixture associated to function getTeamProjects
   */
  public getTeamProjects: jasmine.Spy = jasmine.createSpy('getTeamProjects');
}
