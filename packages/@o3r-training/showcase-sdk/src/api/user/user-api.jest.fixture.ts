import { User } from '../../models/base/user/index';

import { CreateUserRequestData, CreateUsersWithListInputRequestData, DeleteUserRequestData, GetUserByNameRequestData, LoginUserRequestData, LogoutUserRequestData, UpdateUserRequestData, UserApi } from './user-api';

export class UserApiFixture implements Partial<Readonly<UserApi>> {

  /** @inheritDoc */
  public readonly apiName = 'UserApi';

  /**
   * Fixture associated to function createUser
   */
  public createUser: jest.Mock<Promise<never>, [CreateUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function createUsersWithListInput
   */
  public createUsersWithListInput: jest.Mock<Promise<User>, [CreateUsersWithListInputRequestData]> = jest.fn();
  /**
   * Fixture associated to function deleteUser
   */
  public deleteUser: jest.Mock<Promise<never>, [DeleteUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function getUserByName
   */
  public getUserByName: jest.Mock<Promise<User>, [GetUserByNameRequestData]> = jest.fn();
  /**
   * Fixture associated to function loginUser
   */
  public loginUser: jest.Mock<Promise<string>, [LoginUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function logoutUser
   */
  public logoutUser: jest.Mock<Promise<never>, [LogoutUserRequestData]> = jest.fn();
  /**
   * Fixture associated to function updateUser
   */
  public updateUser: jest.Mock<Promise<never>, [UpdateUserRequestData]> = jest.fn();
}

