import { ComponentsApi } from './components-api';

export class ComponentsApiFixture implements Partial<Readonly<ComponentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ComponentsApi';

    /**
   * Fixture associated to function getComponent
   */
  public getComponent: jasmine.Spy = jasmine.createSpy('getComponent');
  /**
   * Fixture associated to function getFileComponents
   */
  public getFileComponents: jasmine.Spy = jasmine.createSpy('getFileComponents');
  /**
   * Fixture associated to function getTeamComponents
   */
  public getTeamComponents: jasmine.Spy = jasmine.createSpy('getTeamComponents');
}
