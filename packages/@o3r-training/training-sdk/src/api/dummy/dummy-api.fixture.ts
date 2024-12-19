import { DummyApi } from './dummy-api';

export class DummyApiFixture implements Partial<Readonly<DummyApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DummyApi';

    /**
   * Fixture associated to function dummyGet
   */
  public dummyGet: jasmine.Spy = jasmine.createSpy('dummyGet');
}
