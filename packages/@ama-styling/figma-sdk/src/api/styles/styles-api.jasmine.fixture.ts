import { StylesApi } from './styles-api';

export class StylesApiFixture implements Partial<Readonly<StylesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'StylesApi';

    /**
   * Fixture associated to function getFileStyles
   */
  public getFileStyles: jasmine.Spy = jasmine.createSpy('getFileStyles');
  /**
   * Fixture associated to function getStyle
   */
  public getStyle: jasmine.Spy = jasmine.createSpy('getStyle');
  /**
   * Fixture associated to function getTeamStyles
   */
  public getTeamStyles: jasmine.Spy = jasmine.createSpy('getTeamStyles');
}
