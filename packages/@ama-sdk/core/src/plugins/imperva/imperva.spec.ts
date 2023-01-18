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

    expect(await runner.canStart()).toBeTruthy();
  });

  it('Should not allow if the cookie is not there and configured to fail', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84', allowCallOnTimeout: false});
    const runner = plugin.load(defaultContext);

    expect(await runner.canStart()).toBeFalsy();
  });

  it('Should respect the configured timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 1000
    });
    const runner = plugin.load(defaultContext);

    const before = Date.now();
    await runner.canStart();
    const after = Date.now();

    expect(after - before).toBeLessThan(1000 + 200);
  });

  it('Should allow if the cookie is not there and configured to allow nonetheless', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84', allowCallOnTimeout: true});
    const runner = plugin.load(defaultContext);

    expect(await runner.canStart()).toBeTruthy();
  });

  it('Should eventually allow if the cookie is set before the plug-in is configured to timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 1000
    });
    const runner = plugin.load(defaultContext);

    const timeout = setTimeout(() => {
      global.document.cookie = 'reese84=12345qwerty';
    }, 500);

    expect(await runner.canStart()).toBeTruthy();
    clearTimeout(timeout);
  });

  it('Should not allow if the cookie is set after the plug-in is configured to timeout', async () => {
    const plugin = new ImpervaFetch({cookieName: 'reese84',
      allowCallOnTimeout: false,
      maximumTries: 2,
      delayBetweenTriesInMilliseconds: 500
    });
    const runner = plugin.load(defaultContext);

    const timeout = setTimeout(() => {
      global.document.cookie = 'reese84=12345qwerty';
    }, 1000);

    expect(await runner.canStart()).toBeFalsy();
    clearTimeout(timeout);
  });
});
