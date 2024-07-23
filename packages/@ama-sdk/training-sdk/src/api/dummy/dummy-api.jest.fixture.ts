
import { DummyApi, DummyApiDummyGetRequestData } from './dummy-api';

export class DummyApiFixture implements Partial<Readonly<DummyApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DummyApi';

    /**
   * Fixture associated to function dummyGet
   */
  public dummyGet: jest.Mock<Promise<void>, [DummyApiDummyGetRequestData]> = jest.fn();
}

