import { VariablesApi } from './variables-api';

export class VariablesApiFixture implements Partial<Readonly<VariablesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'VariablesApi';

    /**
   * Fixture associated to function getLocalVariables
   */
  public getLocalVariables: jasmine.Spy = jasmine.createSpy('getLocalVariables');
  /**
   * Fixture associated to function getPublishedVariables
   */
  public getPublishedVariables: jasmine.Spy = jasmine.createSpy('getPublishedVariables');
  /**
   * Fixture associated to function postVariables
   */
  public postVariables: jasmine.Spy = jasmine.createSpy('postVariables');
}
