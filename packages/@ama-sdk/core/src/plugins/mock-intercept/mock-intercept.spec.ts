import {
  Mock,
  MockAdapter,
} from '../../fwk';
import {
  RequestOptions,
} from '../core';
import {
  CUSTOM_MOCK_REQUEST_HEADER,
} from './mock-intercept.interface';
import {
  MockInterceptRequest,
} from './mock-intercept.request';

const testMock: Mock<any> = {
  mockData: {}
};
const getMockSpy = jest.fn().mockReturnValue(testMock);
const getLatestMockSpy = jest.fn().mockReturnValue(testMock);
const retrieveOperationIdSpy = jest.fn().mockReturnValue(Promise.resolve('testOperation'));
const initializeSpy = jest.fn().mockReturnValue(Promise.resolve());
const testMockAdapter: MockAdapter = {
  getMock: getMockSpy,
  getLatestMock: getLatestMockSpy,
  initialize: initializeSpy,
  retrieveOperationId: retrieveOperationIdSpy
};

describe('Mock intercept', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('request plugin', () => {
    it('should do nothing if disabled is true', async () => {
      const plugin = new MockInterceptRequest({ disabled: true, adapter: testMockAdapter });
      const originalRequest: RequestOptions = {
        method: 'get',
        headers: new Headers({ test: 'true' }),
        basePath: 'myurl'
      };
      const loaded = plugin.load();

      expect(await loaded.transform(originalRequest)).toEqual(originalRequest);
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should not stringify provided api', async () => {
      const plugin = new MockInterceptRequest({ disabled: false, adapter: testMockAdapter });
      const loaded = plugin.load();
      const originalRequest: RequestOptions = {
        method: 'get',
        headers: new Headers({ test: 'true' }),
        basePath: 'myurl',
        api: 'should not exist' as any
      };
      await loaded.transform(originalRequest);

      expect(originalRequest.headers.has(CUSTOM_MOCK_REQUEST_HEADER)).toBe(true);
      expect(Object.keys(JSON.parse(originalRequest.headers.get(CUSTOM_MOCK_REQUEST_HEADER)))).not.toContainEqual('api');
    });

    it('should intercept the request', async () => {
      // Disabled because Blob URL is not supported on NodeJS
      const plugin = new MockInterceptRequest({ adapter: testMockAdapter });
      const originalRequest: RequestOptions = {
        headers: new Headers({ test: 'true' }),
        basePath: 'myurl',
        method: 'PATCH'
      };
      const loaded = plugin.load();
      const transformed = await loaded.transform(originalRequest);
      const res = await fetch(transformed.basePath, transformed);
      const text = await res.text();

      expect(getMockSpy).toHaveBeenCalled();
      expect(text).toBe(JSON.stringify(testMock.mockData));
      expect(initializeSpy).toHaveBeenCalled();
    });
  });
});
