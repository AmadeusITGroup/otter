import type { ConfigurationBaseService } from '@o3r/configuration';

/**
 * Fixture file for configuration service
 */
export class ConfigurationBaseServiceFixture implements Readonly<ConfigurationBaseService> {
  /** @inheritDoc */
  public updateConfiguration: jasmine.Spy = jasmine.createSpy('updateConfiguration');
  /** @inheritDoc */
  public upsertConfiguration: jasmine.Spy = jasmine.createSpy('upsertConfiguration');
  /** @inheritDoc */
  public computeConfiguration: jasmine.Spy = jasmine.createSpy('computeConfiguration');
  /** @inheritDoc */
  public getConfigFromBodyTag: jasmine.Spy = jasmine.createSpy('getConfigFromBodyTag');
  /** @inheritDoc */
  public extendConfiguration: jasmine.Spy = jasmine.createSpy('extendConfiguration');
  /** @inheritDoc */
  public getComponentConfig: jasmine.Spy = jasmine.createSpy('getComponentConfig');
  /** @inheritDoc */
  public getConfig: jasmine.Spy = jasmine.createSpy('getConfig');
}
