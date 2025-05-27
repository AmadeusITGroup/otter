import { GetComponentSet200Response } from '../../models/base/get-component-set200-response/index';
import { GetFileComponentSets200Response } from '../../models/base/get-file-component-sets200-response/index';
import { GetTeamComponentSets200Response } from '../../models/base/get-team-component-sets200-response/index';

import { ComponentSetsApi, ComponentSetsApiGetComponentSetRequestData, ComponentSetsApiGetFileComponentSetsRequestData, ComponentSetsApiGetTeamComponentSetsRequestData } from './component-sets-api';

export class ComponentSetsApiFixture implements Partial<Readonly<ComponentSetsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ComponentSetsApi';

    /**
   * Fixture associated to function getComponentSet
   */
  public getComponentSet: jest.Mock<Promise<GetComponentSet200Response>, [ComponentSetsApiGetComponentSetRequestData]> = jest.fn();
  /**
   * Fixture associated to function getFileComponentSets
   */
  public getFileComponentSets: jest.Mock<Promise<GetFileComponentSets200Response>, [ComponentSetsApiGetFileComponentSetsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getTeamComponentSets
   */
  public getTeamComponentSets: jest.Mock<Promise<GetTeamComponentSets200Response>, [ComponentSetsApiGetTeamComponentSetsRequestData]> = jest.fn();
}

