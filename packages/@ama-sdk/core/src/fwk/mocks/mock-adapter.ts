import type {
  EncodedApiRequest,
} from './encoded-api-request';
import {
  Mock,
} from './mock';

/** Describes an adapter for mocking */
export interface MockAdapter {
  /**
   * Gets a mock from an operation id
   * @param operationId id of the desired operation
   */
  getMock(operationId: string): Mock<any>;

  /**
   * Retrieves the latest mock with the given operation id
   * @param operationId id of the desired operation
   */
  getLatestMock(operationId: string): Mock<any>;

  /**
   * Retrieves an operation ID from an API request
   * @param request the api request
   */
  retrieveOperationId(request: EncodedApiRequest): Promise<string>;

  /**
   * Initializes the adapter
   */
  initialize(): Promise<void>;
}
