import { DevResourcesApi } from './dev-resources-api';

export class DevResourcesApiFixture implements Partial<Readonly<DevResourcesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DevResourcesApi';

    /**
   * Fixture associated to function deleteDevResource
   */
  public deleteDevResource: jasmine.Spy = jasmine.createSpy('deleteDevResource');
  /**
   * Fixture associated to function getDevResources
   */
  public getDevResources: jasmine.Spy = jasmine.createSpy('getDevResources');
  /**
   * Fixture associated to function postDevResources
   */
  public postDevResources: jasmine.Spy = jasmine.createSpy('postDevResources');
  /**
   * Fixture associated to function putDevResources
   */
  public putDevResources: jasmine.Spy = jasmine.createSpy('putDevResources');
}
