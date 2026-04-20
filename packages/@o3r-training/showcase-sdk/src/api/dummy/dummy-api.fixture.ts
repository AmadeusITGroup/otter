import { DummyApi } from './dummy-api';

export class DummyApiFixture implements Partial<Readonly<DummyApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DummyApi';

    /**
   * Fixture associated to function animalGet
   */
  public animalGet: jasmine.Spy = jasmine.createSpy('animalGet');
}
