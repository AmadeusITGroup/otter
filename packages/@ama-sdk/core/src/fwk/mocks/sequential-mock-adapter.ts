import { BaseMockAdapter } from './base-mock-adapter';
import { Mock } from './mock';

/**
 * Mock adapter that, for each operation, runs through the list of mocks sequentially.
 * Once reaching the end of the list, the counter resets to the beginning.
 */
export class SequentialMockAdapter extends BaseMockAdapter {
  protected operationCounter: {[operationId: string]: number} = {};

  /** @inheritdoc */
  public getMock(operationId: string): Mock<any> {
    const mocks = this.mocks[operationId];
    if (!mocks || mocks.length === 0) {
      throw new Error(`No mocks have been found for operationId: ${operationId}`);
    }
    let mockIndex = this.operationCounter[operationId];
    if (!mockIndex || mockIndex >= mocks.length) {
      mockIndex = 0;
      this.operationCounter[operationId] = 0;
    }
    this.operationCounter[operationId]++;
    return mocks[mockIndex];
  }

  /** @inheritdoc */
  public getLatestMock(operationId: string): Mock<any> {
    const mockIndex = (this.operationCounter[operationId] || 0) - 1;
    const mocks = this.mocks[operationId];

    if (mockIndex < 0) {
      throw new Error(`No latest mock has been found for operationId: ${operationId}`);
    }

    return mocks[mockIndex];
  }
}
