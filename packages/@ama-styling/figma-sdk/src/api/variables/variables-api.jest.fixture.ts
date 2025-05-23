import { GetLocalVariables200Response } from '../../models/base/get-local-variables200-response/index';
import { GetPublishedVariables200Response } from '../../models/base/get-published-variables200-response/index';
import { PostVariables200Response } from '../../models/base/post-variables200-response/index';

import { VariablesApi, VariablesApiGetLocalVariablesRequestData, VariablesApiGetPublishedVariablesRequestData, VariablesApiPostVariablesRequestData } from './variables-api';

export class VariablesApiFixture implements Partial<Readonly<VariablesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'VariablesApi';

    /**
   * Fixture associated to function getLocalVariables
   */
  public getLocalVariables: jest.Mock<Promise<GetLocalVariables200Response>, [VariablesApiGetLocalVariablesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getPublishedVariables
   */
  public getPublishedVariables: jest.Mock<Promise<GetPublishedVariables200Response>, [VariablesApiGetPublishedVariablesRequestData]> = jest.fn();
  /**
   * Fixture associated to function postVariables
   */
  public postVariables: jest.Mock<Promise<PostVariables200Response>, [VariablesApiPostVariablesRequestData]> = jest.fn();
}

