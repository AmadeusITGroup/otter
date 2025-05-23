import { GetDevResources200Response } from '../../models/base/get-dev-resources200-response/index';
import { PostDevResources200Response } from '../../models/base/post-dev-resources200-response/index';
import { PutDevResources200Response } from '../../models/base/put-dev-resources200-response/index';

import { DevResourcesApi, DevResourcesApiDeleteDevResourceRequestData, DevResourcesApiGetDevResourcesRequestData, DevResourcesApiPostDevResourcesRequestData, DevResourcesApiPutDevResourcesRequestData } from './dev-resources-api';

export class DevResourcesApiFixture implements Partial<Readonly<DevResourcesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DevResourcesApi';

    /**
   * Fixture associated to function deleteDevResource
   */
  public deleteDevResource: jest.Mock<Promise<void>, [DevResourcesApiDeleteDevResourceRequestData]> = jest.fn();
  /**
   * Fixture associated to function getDevResources
   */
  public getDevResources: jest.Mock<Promise<GetDevResources200Response>, [DevResourcesApiGetDevResourcesRequestData]> = jest.fn();
  /**
   * Fixture associated to function postDevResources
   */
  public postDevResources: jest.Mock<Promise<PostDevResources200Response>, [DevResourcesApiPostDevResourcesRequestData]> = jest.fn();
  /**
   * Fixture associated to function putDevResources
   */
  public putDevResources: jest.Mock<Promise<PutDevResources200Response>, [DevResourcesApiPutDevResourcesRequestData]> = jest.fn();
}

