import {EmptyResponseError, ResponseTimeoutError} from '../../fwk/errors';
import {
  impervaCaptchaEventHandlerFactory,
  TimeoutFetch,
  TimeoutStatus
} from './timeout.fetch';

describe('Timeout Fetch Plugin', () => {

  it('should reject on timeout', async () => {
    const plugin = new TimeoutFetch(100);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve(undefined), 1000));

    const callback = jest.fn();
    runner.transform(call).catch(callback);
    await jest.advanceTimersByTimeAsync(99);
    expect(callback).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledWith(new ResponseTimeoutError('in 100ms'));
  });

  it('should not reject on fetch rejection', async () => {
    const plugin = new TimeoutFetch(6000);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((_resolve, reject) => setTimeout(() => reject(new EmptyResponseError('')), 100));


    const callback = jest.fn();
    runner.transform(call).catch(callback);
    await jest.advanceTimersByTimeAsync(6000);
    expect(callback).toHaveBeenCalledWith(new EmptyResponseError(''));
  });

  it('should forward the fetch response', async () => {
    const plugin = new TimeoutFetch(2000);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 100));

    const promise = runner.transform(call);
    await jest.runAllTimersAsync();

    expect(await promise).toEqual({test: true} as any);
  });

  it('should not reject if the timeout has been paused and reject if restarted', async () => {
    const timeoutPauseEvent = {
      emitEvent: (_status: TimeoutStatus) => {},
      handler: (timeoutPauseCallback: (status: TimeoutStatus) => void) => {
        timeoutPauseEvent.emitEvent = timeoutPauseCallback;
        return () => {};
      }
    };
    const plugin = new TimeoutFetch(100, timeoutPauseEvent.handler);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 500));
    const callback = jest.fn();
    runner.transform(call).catch(callback);
    timeoutPauseEvent.emitEvent('timeoutStopped');
    await jest.advanceTimersByTimeAsync(200);
    timeoutPauseEvent.emitEvent('timeoutStarted');
    await jest.advanceTimersByTimeAsync(200);
    expect(callback).toHaveBeenCalledWith(new ResponseTimeoutError('in 100ms'));
  });

  it('should take into account pause events triggered before the call', async () => {
    const timeoutPauseEvent = {
      emitEvent: (_status: TimeoutStatus) => {},
      handler: (timeoutPauseCallback: (status: TimeoutStatus) => void) => {
        timeoutPauseEvent.emitEvent = timeoutPauseCallback;
        return () => {};
      }
    };
    const plugin = new TimeoutFetch(250, timeoutPauseEvent.handler);

    const runner = plugin.load({controller: new AbortController()} as any);
    const call = new Promise<any>((resolve) => setTimeout(() => resolve({test: true}), 500));
    timeoutPauseEvent.emitEvent('timeoutStopped');
    const promise = runner.transform(call);
    await jest.runAllTimersAsync();

    expect(await promise).toEqual({test: true} as any);
  });
});

describe('impervaCaptchaEventHandlerFactory', () => {
  let postMessageTemp: (msg: any, origin?: string) => any;
  beforeAll(() => {
    global.location ||= {hostname: 'test'} as any;
    global.addEventListener ||= jest.fn().mockImplementation((event, handler) => {
      if (event === 'message') {
        postMessageTemp = (msg, origin?) => {
          const eventObject = {
            origin: origin || 'https://test',
            data: msg
          } as any;
          if (typeof handler === 'object') {
            handler.handleEvent(eventObject);
          } else {
            handler(eventObject);
          }
        };
      }
    }) as any;
  }
  );

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should not throw on unexpected messages', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: []})(callback, this);
    postMessageTemp('pouet');
    expect(callback).not.toHaveBeenCalled();
    postMessageTemp(JSON.stringify({impervaChallenge: {type: 'incorrectType'}}));
    expect(callback).not.toHaveBeenCalled();
    postMessageTemp(JSON.stringify({impervaChallenge: {incorrectFormat: true}}));
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not throw on null messages', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: []})(callback, this);
    postMessageTemp(null);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should trigger a timeoutStopped if the captcha challenge has been started', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: []})(callback, this);
    postMessageTemp(JSON.stringify({impervaChallenge: {status: 'started', type: 'captcha'}}));
    expect(callback).toHaveBeenCalledWith('timeoutStopped');
  });

  it('should trigger a timeoutStarted if the captcha challenge has been finished', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: []})(callback, this);
    postMessageTemp({impervaChallenge: {status: 'ended', type: 'captcha'}});
    expect(callback).toHaveBeenCalledWith('timeoutStarted');
  });

  it('should trigger a timeoutStarted if the captcha challenge has been finished on a whitelisted domain', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: ['valid.domain']})(callback, this);
    postMessageTemp(JSON.stringify({impervaChallenge: {status: 'ended', type: 'captcha'}}), 'http://valid.domain');
    expect(callback).toHaveBeenCalledWith('timeoutStarted');
  });

  it('should ignore postMessage from non whitelisted domain', () => {
    const callback = jest.fn();
    impervaCaptchaEventHandlerFactory({whiteListedHostNames: []})(callback, this);
    postMessageTemp(JSON.stringify({impervaChallenge: {status: 'ended', type: 'captcha'}}), 'http://invalid.domain');
    expect(callback).not.toHaveBeenCalled();
  });
});
