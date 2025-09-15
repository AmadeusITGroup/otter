import {
  OpenTelemetryTraceparentReply,
} from './open-telemetry.traceparent.reply';

describe('OpenTelemetry Traceparent Reply Plugin', () => {
  test('should set basic telemetry information in the response', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: {
        headers: {
          get: jest.fn().mockReturnValue(`00-${'1'.repeat(32)}-${'2'.repeat(16)}-33`)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true } as any);

    expect(storage.getItem).toHaveBeenCalledWith('header key');
    expect(storage.setItem).toHaveBeenCalledWith('header key', expect.stringMatching(/^[a-f0-9]{16}$/));
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({
      field: true,
      _fieldIdTest: {
        version: '00',
        traceId: '1'.repeat(32),
        parentId: '2'.repeat(16),
        traceFlags: '33'
      }
    });
  });

  test('should update existing different token', async () => {
    const storage = {
      getItem: jest.fn().mockReturnValue('a different token'),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: {
        headers: {
          get: jest.fn().mockReturnValue(`00-${'1'.repeat(32)}-${'2'.repeat(16)}-33`)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true } as any);

    expect(storage.getItem).toHaveBeenCalledWith('header key');
    expect(storage.setItem).toHaveBeenCalledWith('header key', expect.stringMatching(/^[a-f0-9]{16}$/));
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({
      field: true,
      _fieldIdTest: {
        version: '00',
        traceId: '1'.repeat(32),
        parentId: '2'.repeat(16),
        traceFlags: '33'
      }
    });
  });

  test('should set basic telemetry information without version', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: {
        headers: {
          get: jest.fn().mockReturnValue(`${'1'.repeat(32)}-${'2'.repeat(16)}-33`)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({} as any);

    expect(storage.getItem).toHaveBeenCalledWith('header key');
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({
      _fieldIdTest: {
        version: '00',
        traceId: '1'.repeat(32),
        parentId: '2'.repeat(16),
        traceFlags: '33'
      }
    });
  });

  test('should set skip when not reply', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: undefined
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({} as any);

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(data).toEqual({});
  });

  test('should skip when no data', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: {
        headers: {
          get: jest.fn().mockReturnValue(`00-${'1'.repeat(32)}-${'2'.repeat(16)}-33`)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform(undefined);

    expect(storage.getItem).toHaveBeenCalledWith('header key');
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({
      _fieldIdTest: {
        version: '00',
        traceId: '1'.repeat(32),
        parentId: '2'.repeat(16),
        traceFlags: '33'
      }
    });
  });

  test('should skip if no header', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      response: {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true } as any);

    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({ field: true });
  });

  test('should skip if invalid header with dash', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const logger = { warn: jest.fn() };

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      logger,
      response: {
        headers: {
          get: jest.fn().mockReturnValue('invalid-token')
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true } as any);

    expect(logger.warn).toHaveBeenCalled();
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({ field: true });
  });

  test('should skip if invalid header without dash', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;
    const logger = { warn: jest.fn() };

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      logger,
      response: {
        headers: {
          get: jest.fn().mockReturnValue('invalidToken')
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true } as any);

    expect(logger.warn).toHaveBeenCalled();
    expect(context.response.headers.get).toHaveBeenCalledWith('test header');
    expect(data).toEqual({ field: true });
  });

  test('should warn in case of data override', async () => {
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    } as any;

    const plugin = new OpenTelemetryTraceparentReply({
      storage,
      traceparentHeader: 'test header',
      parentIdStorageKey: 'header key',
      dataField: '_fieldIdTest'
    });
    const context = {
      logger: { warn: jest.fn() },
      response: {
        headers: {
          get: jest.fn().mockReturnValue(`00-${'1'.repeat(32)}-${'2'.repeat(16)}-33`)
        }
      }
    } as any;
    const runner = plugin.load(context);
    const data = await runner.transform({ field: true, _fieldIdTest: {} } as any);

    expect(context.logger.warn).toHaveBeenCalledWith(expect.stringMatching(/^The field "_fieldIdTest" already exist/));
    expect(data).toEqual({
      field: true,
      _fieldIdTest: {
        version: '00',
        traceId: '1'.repeat(32),
        parentId: '2'.repeat(16),
        traceFlags: '33'
      }
    });
  });
});
