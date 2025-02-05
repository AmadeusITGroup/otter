import { Flight } from '../../models/base/flight/index';

import { DummyApi, DummyApiDummyGetRequestData } from './dummy-api';

export class DummyApiFixture implements Partial<Readonly<DummyApi>> {

  /** @inheritDoc */
  public readonly apiName = 'DummyApi';

  /**
   * Fixture associated to function dummyGet
   */
  public dummyGet: jest.Mock<Promise<Flight>, [DummyApiDummyGetRequestData]> = jest.fn();
}

