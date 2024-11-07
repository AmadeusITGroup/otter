import {
  ApiClient,
  CUSTOM_MOCK_OPERATION_ID_HEADER,
  CUSTOM_MOCK_REQUEST_HEADER,
  Mock,
  MockAdapter,
  MockInterceptRequest,
  RequestOptions,
  RequestPlugin,
  SequentialMockAdapter
} from '@ama-sdk/core';
import {
  MockInterceptFetch
} from './mock-intercept.fetch';

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

const requestPlugins: RequestPlugin[] = [new MockInterceptRequest({ adapter: new SequentialMockAdapter([], {}) })];
const apiClient = {
  options: {
    requestPlugins,
    basePath: 'test',
    replyPlugins: []
  }
} as ApiClient;

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
      const res = await (await fetch(transformed.basePath, transformed)).text();

      expect(getMockSpy).toHaveBeenCalled();
      expect(res).toBe(JSON.stringify(testMock.mockData));
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('fetch plugin', () => {
    describe('when using an initialization function', () => {
      let plugin: MockInterceptFetch;
      let asyncMockAdapter: MockAdapter;

      beforeEach(() => {
        asyncMockAdapter = {
          initialize: initializeSpy,
          getMock: getMockSpy,
          getLatestMock: getLatestMockSpy,
          retrieveOperationId: retrieveOperationIdSpy
        };
        plugin = new MockInterceptFetch({ adapter: asyncMockAdapter });
      });

      it('should call initialize fn', async () => {
        const loadedPlugin = plugin.load({
          controller: jest.fn() as any,
          fetchPlugins: [],
          url: 'myurl',
          apiClient,
          options: {
            headers: new Headers({
              [CUSTOM_MOCK_OPERATION_ID_HEADER]: 'testOperation'
            })
          }
        });
        const testData: any = { test: true };
        await loadedPlugin.transform(Promise.resolve(testData));

        expect(initializeSpy).toHaveBeenCalled();
        expect(getMockSpy).not.toHaveBeenCalled();
        expect(getLatestMockSpy).toHaveBeenCalledWith('testOperation');
      });

      it('should throw if there is no request plugin', () => {
        const config = {
          controller: jest.fn() as any,
          fetchPlugins: [],
          url: 'myurl',
          apiClient: {
            options: {
              requestPlugins: []
            }
          } as ApiClient,
          options: {
            headers: new Headers({
              [CUSTOM_MOCK_OPERATION_ID_HEADER]: 'testOperation'
            })
          }
        };

        expect(() => plugin.load(config)).toThrow();
      });
    });
  });

  describe('with delay', () => {
    it('should delay the response of the specific number', async () => {
      const plugin = new MockInterceptFetch({ adapter: testMockAdapter, delayTiming: 700 });
      const loadedPlugin = plugin.load({
        controller: jest.fn() as any,
        fetchPlugins: [],
        url: '',
        apiClient,
        options: {
          headers: new Headers({
            [CUSTOM_MOCK_OPERATION_ID_HEADER]: 'testOperation'
          })
        }
      });
      const callback = jest.fn();
      const run = loadedPlugin.transform(Promise.resolve({} as any)).then(callback);
      await jest.advanceTimersByTimeAsync(699);
      expect(callback).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1);
      expect(callback).toHaveBeenCalled();
      await run;
    });

    it('should delay the response based on callback', async () => {
      const plugin = new MockInterceptFetch({ adapter: testMockAdapter, delayTiming: () => 800 });
      const loadedPlugin = plugin.load({
        controller: jest.fn() as any,
        fetchPlugins: [],
        url: '',
        apiClient,
        options: {
          headers: new Headers({
            [CUSTOM_MOCK_OPERATION_ID_HEADER]: 'testOperation'
          })
        }
      });
      const callback = jest.fn();
      const run = loadedPlugin.transform(Promise.resolve({} as any)).then(callback);
      await jest.advanceTimersByTimeAsync(799);
      expect(callback).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1);
      expect(callback).toHaveBeenCalled();
      await run;
    });
  });
});
