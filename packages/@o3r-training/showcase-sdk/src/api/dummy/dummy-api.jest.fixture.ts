import { Animal } from '../../models/base/animal/index';

import { DummyApi, DummyApiAnimalGetRequestData } from './dummy-api';

export class DummyApiFixture implements Partial<Readonly<DummyApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DummyApi';

    /**
   * Fixture associated to function animalGet
   */
  public animalGet: jest.Mock<Promise<Animal>, [DummyApiAnimalGetRequestData]> = jest.fn();
}

