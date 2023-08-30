import {ImpervaFetch} from './imperva.fetch';

declare let global: any;

describe('Imperva fetch plug-in', () => {

  const defaultContext: any = {};
  let documentBackup: any;

  beforeEach(() => {
    documentBackup = global.document;
    global.document = {};
  });

  afterEach(() => {
    global.document = documentBackup;
  });

  it('Should allow if cookie is already there', async () => {
    global.document.cookie = 'reese84=12345qwerty';
    const plugin = new ImpervaFetch({cookieName: 'reese84'});
    const runner = plugin.load(defaultContext);

    const canStart = runner.canStart();
    await jest.runAllTimersAsync();
    expect(await canStart).toBeTruthy();
  });

  it('Should not allow if the cookie is not there and configured to fail', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84', allowCallOnTimeout: false});
    const runner = plugin.load(defaultContext);

    const canStart = runner.canStart();
    await jest.runAllTimersAsync();
    expect(await canStart).toBeFalsy();
  });

  it('Should respect the configured timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 1000
    });
    const runner = plugin.load(defaultContext);

    const callback = jest.fn();
    runner.canStart().then(callback);
    await jest.advanceTimersByTimeAsync(999);
    expect(callback).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalled();
  });

  it('Should allow if the cookie is not there and configured to allow nonetheless', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84', allowCallOnTimeout: true});
    const runner = plugin.load(defaultContext);

    const canStart = runner.canStart();
    await jest.runAllTimersAsync();
    expect(await canStart).toBeTruthy();
  });

  it('Should eventually allow if the cookie is set before the plug-in is configured to timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 1000
    });
    const runner = plugin.load(defaultContext);

    const canStart = runner.canStart();
    await jest.advanceTimersByTimeAsync(500);
    global.document.cookie = 'reese84=12345qwerty';
    await jest.advanceTimersByTimeAsync(500);

    expect(await canStart).toBeTruthy();
  });

  it('Should not allow if the cookie is set after the plug-in is configured to timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 500
    });
    const runner = plugin.load(defaultContext);

    const canStart = runner.canStart();
    await jest.advanceTimersByTimeAsync(1000);
    global.document.cookie = 'reese84=12345qwerty';

    expect(await canStart).toBeFalsy();
  });
});
