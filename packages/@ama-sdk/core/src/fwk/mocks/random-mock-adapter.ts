import {
  BaseMockAdapter,
} from './base-mock-adapter';
import {
  Mock,
} from './mock';

/**
 * Mock adapter that, for each operation, runs through the list of mocks randomly
 */
export class RandomMockAdapter extends BaseMockAdapter {
  private readonly cache: Record<string, Mock> = {};

  private getSingleMock(mocks: Mock<any>[]) {
    const mockIndex = Math.floor(Math.random() * mocks.length);
    return mocks[mockIndex];
  }

  /** @inheritDoc */
  public getMock(operationId: string): Mock<any> {
    const mocks = this.mocks[operationId];
    if (!mocks || mocks.length === 0) {
      throw new Error(`No mocks have been found for operationId: ${operationId}`);
    }
    const mock = this.getSingleMock(mocks);
    this.cache[operationId] = mock;
    return mock;
  }

  /** @inheritdoc */
  public getLatestMock(operationId: string): Mock<any> {
    const mock = this.cache[operationId];
    if (!mock) {
      throw new Error(`No latest mock has been found for operationId: ${operationId}`);
    }
    return mock;
  }
}
