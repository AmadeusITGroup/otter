import { ComponentSetsApi } from './component-sets-api';

export class ComponentSetsApiFixture implements Partial<Readonly<ComponentSetsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ComponentSetsApi';

    /**
   * Fixture associated to function getComponentSet
   */
  public getComponentSet: jasmine.Spy = jasmine.createSpy('getComponentSet');
  /**
   * Fixture associated to function getFileComponentSets
   */
  public getFileComponentSets: jasmine.Spy = jasmine.createSpy('getFileComponentSets');
  /**
   * Fixture associated to function getTeamComponentSets
   */
  public getTeamComponentSets: jasmine.Spy = jasmine.createSpy('getTeamComponentSets');
}
