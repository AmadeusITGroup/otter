import {
  z,
} from 'zod';
import {
  AmaMcpServer,
} from './index';

jest.mock('@o3r/telemetry', () => ({
  createGenAICallbackWithMetrics: jest.fn((callback: (...args: any[]) => any) => callback),
  sendGenAIEventMetricsIfAuthorized: jest.fn()
}));

const promptResult = { messages: [{ role: 'user' as const, content: { type: 'text' as const, text: 'hello' } }] };

describe('AmaMcpServer.registerPrompt', () => {
  let server: AmaMcpServer;
  let superRegisterPromptSpy: jest.SpyInstance;

  beforeEach(() => {
    server = new AmaMcpServer({}, { name: 'test-server', version: '0.0.0' });
    superRegisterPromptSpy = jest.spyOn(Object.getPrototypeOf(AmaMcpServer.prototype), 'registerPrompt');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register a prompt without arguments', () => {
    const registered = server.registerPrompt('no-args', { title: 'No args' }, () => promptResult);

    expect(registered).toBeDefined();
    expect(superRegisterPromptSpy).toHaveBeenCalledWith('no-args', { title: 'No args' }, expect.any(Function));
  });

  it('should register a prompt with a standard schema', async () => {
    const registered = server.registerPrompt('with-schema', { argsSchema: z.object({ name: z.string() }) }, ({ name }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: name } }]
    }));

    expect(registered).toBeDefined();
    const wrappedCallback = superRegisterPromptSpy.mock.calls[0][2] as (...args: any[]) => Promise<typeof promptResult>;
    await expect(wrappedCallback({ name: 'otter' }, {})).resolves.toEqual({ messages: [{ role: 'user', content: { type: 'text', text: 'otter' } }] });
  });

  it('should register a prompt with a legacy raw shape', () => {
    const registered = server.registerPrompt('raw-shape', { argsSchema: { name: z.string() } }, ({ name }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: name } }]
    }));

    expect(registered).toBeDefined();
  });

  it('should rethrow the error of the SDK when the registration fails', () => {
    server.registerPrompt('duplicated', {}, () => promptResult);

    expect(() => server.registerPrompt('duplicated', {}, () => promptResult)).toThrow();
  });
});
