import { RequestOptions } from '../core';
import {
  akamaiTelemetryRetrieverFactory,
  BotProtectionFingerprintRequest,
  BotProtectionFingerprintRetriever,
  cookieRetrieverFactory,
  impervaLocalStorageRetrieverFactory, ImpervaProtection, impervaProtectionRetrieverFactory
} from './bot-protection-fingerprint.request';

declare let global: any;

describe('BotProtectionFingerprint', () => {

  describe('Retrievers', () => {

    describe('impervaProtectionRetrieverFactory', () => {
      let consoleMock;
      let windowBackup: any;
      let tokenValue: string;
      let retriever: BotProtectionFingerprintRetriever;

      const protectionResolve: ImpervaProtection = {
        token: () => Promise.resolve(tokenValue)
      };

      const protectionReject: ImpervaProtection = {
        token: () => Promise.reject('error')
      };

      const registerEvent = (protection, delay = 0) => {
        Object.defineProperty(global.window, 'protectionLoaded', {
          set: (handler) => {
            setTimeout(() => handler(protection || protectionResolve), delay);
          },
          configurable: true
        });
      };

      beforeEach(() => {
        consoleMock = jest.spyOn(console, 'warn').mockImplementation();
        windowBackup = global.window;
        // eslint-disable-next-line no-global-assign
        global.window = {} as any;
        retriever = impervaProtectionRetrieverFactory(50, 50);
        tokenValue = 'dummyToken';
      });

      afterEach(() => {
        // eslint-disable-next-line no-global-assign
        global.window = windowBackup;
        consoleMock.mockReset();
      });

      it('Should return undefined and log if no Protection object is received.', async () => {
        const promise = retriever();
        await jest.runAllTimersAsync();
        expect(await promise).toBeUndefined();
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      it('Should return undefined and log if no Protection object is received within configured timeout.', async () => {
        registerEvent(protectionResolve, 100);

        const promise = retriever();
        await jest.runAllTimersAsync();
        expect(await promise).toBeUndefined();
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      it('Should return undefined and log if token promise rejected.', async () => {
        registerEvent(protectionReject);

        const promise = retriever();
        await jest.runAllTimersAsync();
        expect(await promise).toBeUndefined();
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      it('Should return the token if everything happened within timeout values.', async () => {
        registerEvent(protectionResolve, 25);

        const promise = retriever();
        await jest.runAllTimersAsync();
        expect(await promise).toBe(tokenValue);

        tokenValue = 'newToken';

        const newPromise = retriever();
        await jest.runAllTimersAsync();
        expect(await newPromise).toBe(tokenValue);
        expect(console.warn).not.toHaveBeenCalled();
      });

    });

    describe('cookieRetrieverFactory', () => {
      let documentBackup: any;
      const cookieName = 'test1';
      const cookieValue = 'value1';
      const cookieName2 = 'test2';
      const cookieValue2 = 'value2';

      const fullCookie = `${cookieName}=${cookieValue}`;
      const fullCookie2 = `${cookieName2}=${cookieValue2}`;

      const retriever = cookieRetrieverFactory(cookieName);
      const retriever2 = cookieRetrieverFactory(cookieName2);

      beforeEach(() => {
        documentBackup = global.document;
        global.document = {};
      });

      afterEach(() => {
        global.document = documentBackup;
      });

      it('Should throw if document is not defined.', () => {
        global.document = undefined;

        expect(retriever).toThrow();
      });

      it('Should return undefined if no cookies are there.', () => {
        expect(retriever()).not.toBeDefined();
      });

      it('Should return undefined if cookies are there but not the one specified.', () => {
        global.document.cookie = fullCookie2;

        expect(retriever()).not.toBeDefined();
      });

      it('Should return the value of the cookie with the name specified when present.', () => {
        global.document.cookie = `${fullCookie}; ${fullCookie2}`;

        expect(retriever()).toBe(cookieValue);
        expect(retriever2()).toBe(cookieValue2);
        global.document.cookie = `${fullCookie2}; ${fullCookie}`;

        expect(retriever()).toBe(cookieValue);
        expect(retriever2()).toBe(cookieValue2);
      });
    });

    describe('impervaLocalStorageRetrieverFactory', () => {
      let localStorageBackup: any;

      let localStorageValue: Record<string, string>;
      const localStorageMock = {
        getItem: (key: string) => localStorageValue[key],
        setItem: (key: string, value: string) => localStorageValue[key] = value
      };

      const storageKey = 'fingerprint';
      const validEntry = {
        token: 'testtoken',
        renewTime: Date.now() + 1000 * 60 * 60
      };

      const expiredEntry = {
        token: 'testtoken',
        renewTime: Date.now() - 1
      };

      const retriever = impervaLocalStorageRetrieverFactory(storageKey);
      const retrieverIgnoreExpired = impervaLocalStorageRetrieverFactory(storageKey, true);

      beforeEach(() => {
        localStorageValue = {};
        localStorageBackup = global.localStorage;
        global.localStorage = localStorageMock;
      });

      afterEach(() => {
        global.localStorage = localStorageBackup;
      });

      it('Should throw if localStorage is not defined.', () => {
        global.localStorage = undefined;

        expect(retriever).toThrow();
      });

      it('Should return undefined if the storage doesn\'t contain the specified key.', () => {
        expect(retriever()).not.toBeDefined();
      });

      it('Should return undefined if the storage contains a malformed entry.', () => {
        localStorageMock.setItem(storageKey, 'malformed json');

        expect(retriever()).not.toBeDefined();
        localStorageMock.setItem(storageKey, '{"random": "property"}');

        expect(retriever()).not.toBeDefined();
      });

      it('Should return the stored token if still valid', () => {
        localStorageMock.setItem(storageKey, JSON.stringify(validEntry));

        expect(retriever()).toBe(validEntry.token);
      });

      it('Should return undefined by default if the stored token has expired', () => {
        localStorageMock.setItem(storageKey, JSON.stringify(expiredEntry));

        expect(retriever()).not.toBeDefined();
      });

      it('Should return expired token if configured to do so.', () => {
        localStorageMock.setItem(storageKey, JSON.stringify(expiredEntry));

        expect(retrieverIgnoreExpired()).toBe(expiredEntry.token);
      });
    });

    describe('akamaiTelemetryRetrieverFactory', () => {
      it('Should return undefined if bmak object doesn\'t exist.', () => {
        expect(akamaiTelemetryRetrieverFactory()()).toBeUndefined();
        expect(akamaiTelemetryRetrieverFactory({} as any)()).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/naming-convention,camelcase
        expect(akamaiTelemetryRetrieverFactory({get_telemetry: 'test'} as any)()).toBeUndefined();
      });

      it('Should return telemetry', () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention,camelcase
        expect(akamaiTelemetryRetrieverFactory({get_telemetry: () => { return 'telemetryValue';}})()).toBe('telemetryValue');
        global.window = {};
        // eslint-disable-next-line @typescript-eslint/naming-convention,camelcase
        global.window.bmak = {get_telemetry: () => { return 'telemetryValue2';}};

        expect(akamaiTelemetryRetrieverFactory()()).toBe('telemetryValue2');
        global.window = undefined;
      });
    });
  });


  describe('Plug-in', () => {
    let mockedRequest: RequestOptions;
    let mockedFingerprint: string | undefined;
    let fingerprintRetriever: BotProtectionFingerprintRetriever;

    const destinationHeaderName = 'test-header';

    beforeEach(() => {
      mockedFingerprint = undefined;
      mockedRequest = {
        method: 'get',
        basePath: 'toto',
        headers: new Headers()
      };
      fingerprintRetriever = jest.fn().mockImplementation(() => mockedFingerprint);
    });

    it('Should add the fingerprint header if a fingerprint is found.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: undefined,
        pollOnlyOnce: false
      }).load();

      mockedFingerprint = 'fingerprint';
      const newRequest = await plugin.transform(mockedRequest);

      expect(newRequest.headers.get(destinationHeaderName)).toBe(mockedFingerprint);
      expect(fingerprintRetriever).toHaveBeenCalledTimes(1);
    });

    it('Should\' add the fingerprint header if no fingerprint is found with no poller.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: undefined,
        pollOnlyOnce: false
      }).load();

      const newRequest = await plugin.transform(mockedRequest);

      expect(newRequest.headers.has(destinationHeaderName)).toBeFalsy();
      expect(fingerprintRetriever).toHaveBeenCalledTimes(1);
    });

    it('Should add the fingerprint header if there is no fingerprint after the configured poller has finished running.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: {
          maximumTries: 5,
          delayBetweenTriesInMilliseconds: 250
        },
        pollOnlyOnce: false
      }).load();

      const newRequestPromise = plugin.transform(mockedRequest);
      await jest.advanceTimersByTimeAsync(1000);
      const newRequest = await newRequestPromise;

      expect(newRequest.headers.has(destinationHeaderName)).toBeFalsy();
      expect(fingerprintRetriever).toHaveBeenCalledTimes(5);
    });

    it('Should add the fingerprint header if initially not found but added before the poller ended.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: {
          maximumTries: 5,
          delayBetweenTriesInMilliseconds: 250
        },
        pollOnlyOnce: false
      }).load();
      setTimeout(() => mockedFingerprint = 'fingerprint', 350);

      const newRequestPromise = plugin.transform(mockedRequest);
      await jest.advanceTimersByTimeAsync(350);
      mockedFingerprint = 'fingerprint';
      await jest.runAllTimersAsync();
      const newRequest = await newRequestPromise;

      expect(newRequest.headers.get(destinationHeaderName)).toBe(mockedFingerprint);
      expect(fingerprintRetriever).toHaveBeenCalledTimes(3);
    });

    it('Should poll twice if configured.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: {
          maximumTries: 5,
          delayBetweenTriesInMilliseconds: 250
        },
        pollOnlyOnce: false
      }).load();


      let promise = plugin.transform(mockedRequest);
      await jest.runAllTimersAsync();
      await promise;

      expect(fingerprintRetriever).toHaveBeenCalledTimes(5);

      promise = plugin.transform(mockedRequest);
      await jest.runAllTimersAsync();
      await promise;

      expect(fingerprintRetriever).toHaveBeenCalledTimes(10);
    });

    it('Shouldn\'t poll twice if configured.', async () => {
      const plugin = new BotProtectionFingerprintRequest({
        destinationHeaderName,
        fingerprintRetriever,
        pollerOptions: {
          maximumTries: 5,
          delayBetweenTriesInMilliseconds: 250
        },
        pollOnlyOnce: true
      }).load();

      let promise = plugin.transform(mockedRequest);
      await jest.runAllTimersAsync();
      await promise;

      expect(fingerprintRetriever).toHaveBeenCalledTimes(5);

      promise = plugin.transform(mockedRequest);
      await jest.runAllTimersAsync();
      await promise;

      expect(fingerprintRetriever).toHaveBeenCalledTimes(6);
    });

  });
});
