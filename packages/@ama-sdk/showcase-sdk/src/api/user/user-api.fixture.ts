import { UserApi } from './user-api';

export class UserApiFixture implements Partial<Readonly<UserApi>> {

  /** @inheritDoc */
  public readonly apiName = 'UserApi';

  /**
   * Fixture associated to function createUser
   */
  public createUser: jasmine.Spy = jasmine.createSpy('createUser');
  /**
   * Fixture associated to function createUsersWithListInput
   */
  public createUsersWithListInput: jasmine.Spy = jasmine.createSpy('createUsersWithListInput');
  /**
   * Fixture associated to function deleteUser
   */
  public deleteUser: jasmine.Spy = jasmine.createSpy('deleteUser');
  /**
   * Fixture associated to function getUserByName
   */
  public getUserByName: jasmine.Spy = jasmine.createSpy('getUserByName');
  /**
   * Fixture associated to function loginUser
   */
  public loginUser: jasmine.Spy = jasmine.createSpy('loginUser');
  /**
   * Fixture associated to function logoutUser
   */
  public logoutUser: jasmine.Spy = jasmine.createSpy('logoutUser');
  /**
   * Fixture associated to function updateUser
   */
  public updateUser: jasmine.Spy = jasmine.createSpy('updateUser');
}
