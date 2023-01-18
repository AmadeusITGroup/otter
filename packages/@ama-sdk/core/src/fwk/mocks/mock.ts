/**
 * Defines a mock
 */
export interface Mock<T = any> {
  /** The mocked data */
  mockData: T;
  /** Returns a custom http response with the data */
  getResponse?: () => Response;
}
