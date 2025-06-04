import { UsersApi } from './users-api';

export class UsersApiFixture implements Partial<Readonly<UsersApi>> {

  /** @inheritDoc */
  public readonly apiName = 'UsersApi';

    /**
   * Fixture associated to function getMe
   */
  public getMe: jasmine.Spy = jasmine.createSpy('getMe');
}
