import { User } from '../../models/base/user/index';

import { UserApi, UserApiCreateUserRequestData, UserApiCreateUsersWithListInputRequestData, UserApiDeleteUserRequestData, UserApiGetUserByNameRequestData, UserApiLoginUserRequestData, UserApiLogoutUserRequestData, UserApiUpdateUserRequestData } from './user-api';

export class UserApiFixture implements Partial<Readonly<UserApi>> {

  /** @inheritDoc */
  public readonly apiName = 'UserApi';

    /**
   * Fixture associated to function createUser
   */
  public createUser: jest.Mock<Promise<never>, [UserApiCreateUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function createUsersWithListInput
   */
  public createUsersWithListInput: jest.Mock<Promise<User>, [UserApiCreateUsersWithListInputRequestData]> = jest.fn();
  /**
   * Fixture associated to function deleteUser
   */
  public deleteUser: jest.Mock<Promise<never>, [UserApiDeleteUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function getUserByName
   */
  public getUserByName: jest.Mock<Promise<User>, [UserApiGetUserByNameRequestData]> = jest.fn();
  /**
   * Fixture associated to function loginUser
   */
  public loginUser: jest.Mock<Promise<string>, [UserApiLoginUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function logoutUser
   */
  public logoutUser: jest.Mock<Promise<never>, [UserApiLogoutUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function updateUser
   */
  public updateUser: jest.Mock<Promise<never>, [UserApiUpdateUserRequestData]> = jest.fn();
}

