import { LibraryAnalyticsApi } from './library-analytics-api';

export class LibraryAnalyticsApiFixture implements Partial<Readonly<LibraryAnalyticsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'LibraryAnalyticsApi';

    /**
   * Fixture associated to function getLibraryAnalyticsComponentActions
   */
  public getLibraryAnalyticsComponentActions: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsComponentActions');
  /**
   * Fixture associated to function getLibraryAnalyticsComponentUsages
   */
  public getLibraryAnalyticsComponentUsages: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsComponentUsages');
  /**
   * Fixture associated to function getLibraryAnalyticsStyleActions
   */
  public getLibraryAnalyticsStyleActions: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsStyleActions');
  /**
   * Fixture associated to function getLibraryAnalyticsStyleUsages
   */
  public getLibraryAnalyticsStyleUsages: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsStyleUsages');
  /**
   * Fixture associated to function getLibraryAnalyticsVariableActions
   */
  public getLibraryAnalyticsVariableActions: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsVariableActions');
  /**
   * Fixture associated to function getLibraryAnalyticsVariableUsages
   */
  public getLibraryAnalyticsVariableUsages: jasmine.Spy = jasmine.createSpy('getLibraryAnalyticsVariableUsages');
}
