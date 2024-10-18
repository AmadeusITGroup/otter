import {
  RequestOptions
} from '../core/request-plugin';
import {
  SessionIdRequest
} from './session-id.request';

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

    expect(sessionId).toMatch(/[a-zA-Z0-9-]{10,48}/);
    expect(options.headers.get('Ama-Client-Ref')).toMatch(new RegExp(sessionId + ':[0-9a-zA-Z]{1,10}'));
  });

  it('should be possible to deactivate the request ID part', async () => {
    const plugin = new SessionIdRequest(TEST_KEY, false);
    const runner = plugin.load();
    const sessionId = plugin.sessionId;

    await runner.transform(options);

    expect(sessionId).toMatch(/[a-zA-Z0-9-]{10,48}/);
    expect(options.headers.get(TEST_KEY)).toEqual(sessionId);
  });
});
