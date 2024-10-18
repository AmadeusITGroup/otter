import type {
  ConfigurationBaseService
} from '@o3r/configuration';

/**
 * Fixture file for configuration service
 */
export class ConfigurationBaseServiceFixture implements Readonly<ConfigurationBaseService> {
  /** @inheritDoc */
  public updateConfiguration: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public upsertConfiguration: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public computeConfiguration: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public getConfigFromBodyTag: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public extendConfiguration: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public getComponentConfig: jest.Mock<any, any> = jest.fn();
  /** @inheritDoc */
  public getConfig: jest.Mock<any, any> = jest.fn();
}
