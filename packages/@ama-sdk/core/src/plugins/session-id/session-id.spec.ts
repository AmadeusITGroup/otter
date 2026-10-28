import {
  RequestOptions,
} from '../core/request-plugin';
import {
  SessionIdRequest,
} from './session-id-request';

describe('Session ID Request Plugin', () => {
  let options: RequestOptions;

  const TEST_KEY = 'testKey';
  const TEST_KEY2 = 'testKey2';

  beforeEach(() => {
    options = { headers: new Headers(), basePath: 'http://test.com/truc', method: 'get' };
  });

  it('should have the default id to Ama-Client-Ref', async () => {
    const plugin = new SessionIdRequest();
    const runner = plugin.load();
    const sessionId = plugin.sessionId;

    await runner.transform(options);

    expect(options.headers.get('Ama-Client-Ref')).toContain(sessionId);
  });

  it('should add the session ID to the headers', async () => {
    const plugin = new SessionIdRequest(TEST_KEY);
    const runner = plugin.load();
    const sessionId = plugin.sessionId;

    await runner.transform(options);

    expect(options.headers.get(TEST_KEY)).toContain(sessionId);
  });

  it('second plugin with same header should use the ID that\'s already in memory', () => {
    const plugin = new SessionIdRequest(TEST_KEY);
    const plugin2 = new SessionIdRequest(TEST_KEY);
    plugin.load();
    plugin2.load();

    expect(plugin.sessionId).toBe(plugin2.sessionId);
  });

  it('second plugin with different header should generate a new session ID', () => {
    const plugin = new SessionIdRequest(TEST_KEY);
    const plugin2 = new SessionIdRequest(TEST_KEY2);
    plugin.load();
    plugin2.load();

    expect(plugin.sessionId).not.toBe(plugin2.sessionId);
  });

  it('should generate a correctly formatted ID', async () => {
    const plugin = new SessionIdRequest();
    const runner = plugin.load();
    const sessionId: string = plugin.sessionId;

    await runner.transform(options);

    expect(sessionId).toMatch(/[\dA-Za-z-]{10,48}/);
    expect(options.headers.get('Ama-Client-Ref')).toMatch(new RegExp(sessionId + ':[0-9a-zA-Z]{1,10}'));
  });

  it('should be possible to deactivate the request ID part', async () => {
    const plugin = new SessionIdRequest(TEST_KEY, false);
    const runner = plugin.load();
    const sessionId = plugin.sessionId;

    await runner.transform(options);

    expect(sessionId).toMatch(/[\dA-Za-z-]{10,48}/);
    expect(options.headers.get(TEST_KEY)).toEqual(sessionId);
  });

  describe('with options', () => {
    const SUPPLIED_ID = 'supplied-id';
    let headerIndex = 0;
    /** Unique header per test, as the plugin memory is shared between instances */
    const uniqueHeader = () => `options-test-header-${headerIndex++}`;

    const sendRequest = async (plugin: SessionIdRequest, header: string) => {
      const requestOptions: RequestOptions = { headers: new Headers(), basePath: 'http://test.com/truc', method: 'get' };
      await plugin.load().transform(requestOptions);
      return requestOptions.headers.get(header);
    };

    it('should use the supplied session ID', async () => {
      const header = uniqueHeader();
      const plugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });

      expect(plugin.sessionId).toBe(SUPPLIED_ID);
      expect(await sendRequest(plugin, header)).toMatch(new RegExp(`^${SUPPLIED_ID}:[0-9a-z]+$`));
    });

    it('should default options like the legacy constructor', async () => {
      const defaultPlugin = new SessionIdRequest({});
      expect(await sendRequest(defaultPlugin, 'Ama-Client-Ref')).toContain(defaultPlugin.sessionId);

      const header = uniqueHeader();
      const noRequestIdPlugin = new SessionIdRequest({ sessionIdHeader: header, activateRequestId: false });
      expect(await sendRequest(noRequestIdPlugin, header)).toBe(noRequestIdPlugin.sessionId);
    });

    it('should give priority to the supplied ID over shared memory', () => {
      const header = uniqueHeader();
      const legacyPlugin = new SessionIdRequest(header);
      const plugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });

      expect(legacyPlugin.sessionId).not.toBe(SUPPLIED_ID);
      expect(plugin.sessionId).toBe(SUPPLIED_ID);
    });

    it('should give priority to the supplied ID over session storage', () => {
      const store = new Map<string, string>();
      const globalWithStorage = globalThis as { sessionStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> };
      globalWithStorage.sessionStorage = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key)
      };
      try {
        const header = uniqueHeader();
        sessionStorage.setItem(header, JSON.stringify({ id: 'old-id', generatedTime: new Date().toJSON() }));
        sessionStorage.setItem(`${header}-Request-Count`, '5');

        const plugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });

        expect(plugin.sessionId).toBe(SUPPLIED_ID);
        expect((JSON.parse(sessionStorage.getItem(header) || '{}') as { id?: string }).id).toBe(SUPPLIED_ID);
        expect(sessionStorage.getItem(`${header}-Request-Count`)).toBeNull();
      } finally {
        globalWithStorage.sessionStorage = undefined;
      }
    });

    it('should share the supplied ID with other instances on the same header', () => {
      const header = uniqueHeader();
      new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });
      const legacyPlugin = new SessionIdRequest(header);

      expect(legacyPlugin.sessionId).toBe(SUPPLIED_ID);
    });

    it('should reset the request counter when the supplied ID changes', async () => {
      const header = uniqueHeader();
      const plugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });
      await sendRequest(plugin, header);
      await sendRequest(plugin, header);

      const newPlugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: 'another-id' });

      expect(await sendRequest(newPlugin, header)).toBe('another-id:0');
    });

    it('should keep the request counter when the same ID is supplied again', async () => {
      const header = uniqueHeader();
      const plugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });
      expect(await sendRequest(plugin, header)).toBe(`${SUPPLIED_ID}:0`);
      expect(await sendRequest(plugin, header)).toBe(`${SUPPLIED_ID}:1`);

      const samePlugin = new SessionIdRequest({ sessionIdHeader: header, sessionId: SUPPLIED_ID });

      expect(await sendRequest(samePlugin, header)).toBe(`${SUPPLIED_ID}:2`);
    });

    it('should ignore an empty supplied ID', () => {
      const plugin = new SessionIdRequest({ sessionIdHeader: uniqueHeader(), sessionId: '' });

      expect(plugin.sessionId).toMatch(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/);
    });
  });
});
