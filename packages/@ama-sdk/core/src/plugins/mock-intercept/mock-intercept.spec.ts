import { ApiClient, Mock, MockAdapter, SequentialMockAdapter } from '../../fwk';
import { RequestOptions, RequestPlugin } from '../core';
import { MockInterceptFetch } from './mock-intercept.fetch';
import { CUSTOM_MOCK_OPERATION_ID_HEADER } from './mock-intercept.interface';
import { MockInterceptRequest } from './mock-intercept.request';

const testMock: Mock<any> = {
  mockData: {}
};
const getMockSpy = jest.fn().mockReturnValue(testMock);
const getLatestMockSpy = jest.fn().mockReturnValue(testMock);
const getOperationIdSpy = jest.fn().mockReturnValue('testOperation');
const retrieveOperationIdSpy = jest.fn().mockReturnValue(Promise.resolve('testOperation'));
const initializeSpy = jest.fn().mockReturnValue(Promise.resolve());
const testMockAdapter: MockAdapter = {
  getMock: getMockSpy,
  getLatestMock: getLatestMockSpy,
  getOperationId: getOperationIdSpy,
  initialize: initializeSpy,
  retrieveOperationId: retrieveOperationIdSpy
};

const requestPlugins: RequestPlugin[] = [new MockInterceptRequest({adapter: new SequentialMockAdapter([], {})})];
const apiClient = {
  options: {
    requestPlugins,
    basePath: 'test',
    replyPlugins: []
  }
} as ApiClient;

describe('Mock intercept', () => {
  describe('request plugin', () => {
    it('should do nothing if disabled is true', async () => {
      const plugin = new MockInterceptRequest({ disabled: true, adapter: testMockAdapter });
      const originalRequest: RequestOptions = {
        method: 'get',
        headers: new Headers({test: 'true'}),
        basePath: 'myurl'
      };
      const loaded = plugin.load();

      expect(await loaded.transform(originalRequest)).toEqual(originalRequest);
      expect(initializeSpy).toHaveBeenCalled();
    });

    it.skip('should intercept the request', async () => {
      // Disabled because Blob URL is not supported on NodeJS
      const plugin = new MockInterceptRequest({ adapter: testMockAdapter });
      const originalRequest: RequestOptions = {
        headers: new Headers({test: 'true'}),
        basePath: 'myurl',
        method: 'PATCH'
      };
      const loaded = plugin.load();
      const transformed = loaded.transform(originalRequest) as RequestOptions;
      const res = await fetch(transformed.basePath, transformed);

      expect(getMockSpy).toHaveBeenCalled();
      expect(res).toEqual(getMockSpy);
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
          getOperationId: getOperationIdSpy,
          retrieveOperationId: retrieveOperationIdSpy
        };
        plugin = new MockInterceptFetch({adapter: asyncMockAdapter});
      });

      it('should call initialize fn', async () => {
        const loadedPlugin = plugin.load({
          fetchPlugins: [],
          url: 'myurl',
          apiClient,
          options: {
            headers: new Headers({
              [CUSTOM_MOCK_OPERATION_ID_HEADER]: 'testOperation'
            })
          }
        });
        const testData: any = {test: true};
        await loadedPlugin.transform(Promise.resolve(testData));

        expect(initializeSpy).toHaveBeenCalled();
        expect(getMockSpy).not.toHaveBeenCalled();
        expect(getLatestMockSpy).toHaveBeenCalledWith('testOperation');
      });

      it('should throw if there is no request plugin', () => {
        const config = {
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
      void loadedPlugin.transform(Promise.resolve({} as any)).then(callback);
      await jest.advanceTimersByTimeAsync(699);
      expect(callback).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1);
      expect(callback).toHaveBeenCalled();
    });

    it('should delay the response based on callback', async () => {
      const plugin = new MockInterceptFetch({ adapter: testMockAdapter, delayTiming: () => 800 });
      const loadedPlugin = plugin.load({
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
      void loadedPlugin.transform(Promise.resolve({} as any)).then(callback);
      await jest.advanceTimersByTimeAsync(799);
      expect(callback).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(1);
      expect(callback).toHaveBeenCalled();
    });
  });
});
