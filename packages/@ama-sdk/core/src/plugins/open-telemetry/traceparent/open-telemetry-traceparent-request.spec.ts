import {
  OpenTelemetryTraceparentRequest,
} from './open-telemetry-traceparent-request';

describe('OpenTelemetry Traceparent Request Plugin', () => {
  test('should generate default header', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);

    expect(storage.getItem).toHaveBeenCalledWith('header key');
    expect(storage.setItem).toHaveBeenCalledWith('header key', expect.stringMatching(/^[a-f0-9]{16}$/));
    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^[a-f0-9]{32}-[a-f0-9]{16}-0{2}$/));
  });

  test('should generate header with version', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      version: 20,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);
    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^14-[a-f0-9]{32}-[a-f0-9]{16}-0{2}$/));
  });

  test('should generate header with flags as value', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      traceFlags: 'A',
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);

    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^[a-f0-9]{32}-[a-f0-9]{16}-0a$/));
  });

  test('should generate header with flags as function', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      traceFlags: () => 'A',
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);

    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^[a-f0-9]{32}-[a-f0-9]{16}-0a$/));
  });

  test('should generate dummy trace id', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      generateTraceId: false,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);

    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^0{32}-[a-f0-9]{16}-00$/));
  });

  test('should use stored parent id', async () => {
    const storage = {
      getItem: jest.fn().mockReturnValue('1'.repeat(16)),
      setItem: jest.fn()
    } as any;
    const append = jest.fn() as any;

    const plugin = new OpenTelemetryTraceparentRequest({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key'
    });
    const runner = plugin.load();
    await runner.transform({ headers: { append } } as any);

    expect(append).toHaveBeenCalledWith('test header', expect.stringMatching(/^[a-f0-9]{32}-1{16}-0{2}$/));
  });
});
