import { GetComponent200Response } from '../../models/base/get-component200-response/index';
import { GetFileComponents200Response } from '../../models/base/get-file-components200-response/index';
import { GetTeamComponents200Response } from '../../models/base/get-team-components200-response/index';

import { ComponentsApi, ComponentsApiGetComponentRequestData, ComponentsApiGetFileComponentsRequestData, ComponentsApiGetTeamComponentsRequestData } from './components-api';

export class ComponentsApiFixture implements Partial<Readonly<ComponentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ComponentsApi';

    /**
   * Fixture associated to function getComponent
   */
  public getComponent: jest.Mock<Promise<GetComponent200Response>, [ComponentsApiGetComponentRequestData]> = jest.fn();
  /**
   * Fixture associated to function getFileComponents
   */
  public getFileComponents: jest.Mock<Promise<GetFileComponents200Response>, [ComponentsApiGetFileComponentsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getTeamComponents
   */
  public getTeamComponents: jest.Mock<Promise<GetTeamComponents200Response>, [ComponentsApiGetTeamComponentsRequestData]> = jest.fn();
}

