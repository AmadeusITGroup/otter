import { EncodedApiRequest } from './encoded-api-request';
import { getOperationId, getPath } from './helpers';
import { Mock } from './mock';
import { MockAdapter } from './mock-adapter';
import { PathObject } from './path-object';

export type MockMap = {[operationID: string]: Mock<any>[]};

/**
 * Base implementation of a mock adapter
 */
export abstract class BaseMockAdapter implements MockAdapter {
  protected mocks: MockMap = {};
  protected mockFactory: (() => Promise<MockMap>) | undefined;

  constructor(
    protected pathObjects: PathObject[],
    mockMap: MockMap | (() => Promise<MockMap>)
  ) {
    if (typeof mockMap !== 'function') {
      this.mocks = mockMap;
    } else {
      this.mockFactory = mockMap;
    }
  }

  /** @inheritdoc */
  public abstract getMock(operationId: string): Mock<any>;

  /** @inheritdoc */
  public abstract getLatestMock(operationId: string): Mock<any>;

  /**
   * @inheritDoc
   */
  public getOperationId(request: EncodedApiRequest): string {
    const object = getPath(request.basePath, this.pathObjects, request.method);
    if (!object) {
      throw new Error(`No operation has been found for ${request.basePath}`);
    }
    const id = getOperationId(object, request.method);
    if (!id) {
      throw new Error(`No operation has been found for ${request.method}:${request.basePath}`);
    }
    return id;
  }

  /**
   * @inheritDoc
   */
  public async initialize() {
    if (!this.mockFactory || Object.keys(this.mocks).length > 0) {
      return;
    }
    this.mocks = await this.mockFactory();
  }

}
