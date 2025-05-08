import { GetMe200Response } from '../../models/base/get-me200-response/index';

import { UsersApi, UsersApiGetMeRequestData } from './users-api';

export class UsersApiFixture implements Partial<Readonly<UsersApi>> {

  /** @inheritDoc */
  public readonly apiName = 'UsersApi';

    /**
   * Fixture associated to function getMe
   */
  public getMe: jest.Mock<Promise<GetMe200Response>, [UsersApiGetMeRequestData]> = jest.fn();
}

