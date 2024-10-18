/* eslint-disable @typescript-eslint/naming-convention */

import {
  LocalizationConfiguration
} from '../core';
import {
  TranslationsLoader
} from './translations-loader';

/**
 * @param body
 */
function mockSuccessApiResponse(body = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-type': 'application/json' }
  });
}

/**
 * @param body
 */
function mockFailApiResponse(body = {}) {
  return new Response(JSON.stringify(body), {
    status: 404,
    headers: { 'Content-type': 'application/json' }
  });
}

interface TranslationsDictionnary {
  'good.morning': string;
  'good.evening': string;
}

const responseEN: TranslationsDictionnary = {
  'good.morning': 'Good Morning',
  'good.evening': 'Good Evening'
};

const responseFR: TranslationsDictionnary = {
  'good.morning': 'Bonjour',
  'good.evening': 'Bonsoir'
};

const configuration: LocalizationConfiguration = {
  bundlesOutputPath: '',
  debugMode: false,
  enableTranslationDeactivation: false,
  endPointUrl: '',
  useDynamicContent: false,
  fallbackLanguage: 'en',
  language: 'fr',
  rtlLanguages: ['ar'],
  supportedLocales: [],
  mergeWithLocalTranslations: false
};

describe('TranslationsLoader - no endPointUrl', () => {
  describe('language !== fallback language', () => {
    let translationsLoader: TranslationsLoader;

    beforeEach(() => {
      translationsLoader = new TranslationsLoader(configuration);
    });

    it('OK ' + configuration.language + '.json from local', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      global.fetch = jest.fn().mockImplementation((url: string) => {
        countCall++;
        latestUrls.push(url);
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });

      jest.spyOn(translationsLoader, 'getTranslationFromLocal');

      const subscription = translationsLoader.getTranslation(configuration.language).subscribe((res) => {
        // 1 call
        expect(countCall).toBe(1);
        // fetch from /fr.json
        expect(latestUrls[0]).toBe('fr.json');
        // gets french bundle
        expect(res).toEqual(responseFR);

        subscription.unsubscribe();
        done();
      });
    });

    it('KO ' + configuration.language + '.json from local, fallback OK to local ' + configuration.fallbackLanguage + '.json', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      global.fetch = jest.fn().mockImplementation((url: string) => {
        const lang = url
          .split('/')
          .at(-1)
          .split('.')[0];
        countCall++;
        latestUrls.push(url);
        if (lang === configuration.language) {
          return Promise.reject(mockFailApiResponse());
        }
        return Promise.resolve(mockSuccessApiResponse(responseEN));
      });

      jest.spyOn(translationsLoader, 'getTranslationFromLocal');

      const subscription = translationsLoader.getTranslation(configuration.language).subscribe((res) => {
        // 2 calls
        expect(countCall).toBe(2);
        // fetch from /fr.json
        expect(latestUrls[0]).toBe('fr.json');
        // fetch from /en.json
        expect(latestUrls[1]).toBe('en.json');
        // response is OK
        expect(res).toBeDefined();
        // gets english response
        expect(res).toEqual(responseEN);

        subscription.unsubscribe();
        done();
      });
    });
  });

  describe('language === fallback language', () => {
    const configuration2: LocalizationConfiguration = Object.assign({}, configuration, { fallbackLanguage: 'fr' });
    let translationsLoader: TranslationsLoader;

    beforeEach(() => {
      translationsLoader = new TranslationsLoader(configuration2);
    });

    it('KO ' + configuration2.language + '.json from local, but no second call', (done) => {
      let countCall = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        countCall++;
        return Promise.reject(mockFailApiResponse({}));
      });

      const subscription = translationsLoader.getTranslation(configuration2.language).subscribe(
        () => {},
        () => {},
        () => {
          // just one call done
          expect(countCall).toBe(1);

          subscription.unsubscribe();
          done();
        }
      );
    });
  });
});

describe('TranslationsLoader - with endPointUrl', () => {
  let translationsLoader: TranslationsLoader;
  const configuration3 = Object.assign({}, configuration, { endPointUrl: 'http://myUrl/' });

  describe('local translation merging', () => {
    let translationsBundleSpy: jest.SpyInstance;

    beforeEach(() => {
      translationsBundleSpy = global.fetch = jest.fn().mockImplementation((url: string) => {
        const isDynamicTransaltions = new RegExp(configuration3.endPointUrl).test(url);
        return Promise.resolve(mockSuccessApiResponse(isDynamicTransaltions ? responseFR : { localOnly: 'test' }));
      });
    });

    it('should merge local and dynamic translations', (done) => {
      translationsLoader = new TranslationsLoader({ ...configuration3, mergeWithLocalTranslations: true });
      const subscription = translationsLoader.getTranslation(configuration3.language).subscribe((res) => {
        expect(res.localOnly).toBeDefined();
        expect(res.localOnly).toMatch(/^\[local] /);
        expect(translationsBundleSpy).toHaveBeenCalledTimes(2);
        subscription.unsubscribe();
        done();
      });
    });

    it('should get dynamic translations only', (done) => {
      translationsLoader = new TranslationsLoader({ ...configuration3, mergeWithLocalTranslations: false });
      const subscription = translationsLoader.getTranslation(configuration3.language).subscribe((res) => {
        expect(res.localOnly).not.toBeDefined();
        expect(translationsBundleSpy).toHaveBeenCalledTimes(1);
        subscription.unsubscribe();
        done();
      });
    });
  });

  describe('language !== fallback language', () => {
    beforeEach(() => {
      translationsLoader = new TranslationsLoader(configuration3);
    });

    it('OK ' + configuration3.language + '.json from endPointUrl', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      global.fetch = jest.fn().mockImplementation((url: string) => {
        countCall++;
        latestUrls.push(url);
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });

      jest.spyOn(translationsLoader, 'getTranslationFromLocal');

      const subscription = translationsLoader.getTranslation(configuration3.language).subscribe((res) => {
        // get the fr.json
        expect(res).toEqual(responseFR);
        // 1 call
        expect(countCall).toBe(1);
        // fetch from endPointUrl
        expect(latestUrls[0]).toBe(configuration3.endPointUrl + configuration3.language + '.json');
        // get the fr.json
        expect(res).toEqual(responseFR);

        subscription.unsubscribe();
        done();
      });
    });

    it('KO ' + configuration3.language + '.json from endPointUrl, fallback OK to local ' + configuration3.language + '.json', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      global.fetch = jest.fn().mockImplementation((url: string) => {
        const endPointUrl = configuration3.endPointUrl + configuration3.language + '.json';
        countCall++;
        latestUrls.push(url);
        if (endPointUrl === url) {
          // fail with fr on endPoint
          return Promise.reject(mockFailApiResponse());
        }
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });

      jest.spyOn(translationsLoader, 'getTranslationFromLocal');

      const subscription = translationsLoader.getTranslation(configuration3.language).subscribe((res) => {
        // 2 calls (1 for endPoint which fails + 1 local that is OK)
        expect(countCall).toBe(2);
        // endPoint URL was called
        expect(latestUrls[0]).toBe(configuration3.endPointUrl + configuration3.language + '.json');
        // local URL was called
        expect(latestUrls[1]).toBe(configuration3.language + '.json');
        // get the fr.json
        expect(res).toEqual(responseFR);

        subscription.unsubscribe();
        done();
      });
    });

    it('KO ' + configuration3.language + '.json from endPointUrl, fallback KO to local ' + configuration3.language + '.json, fallback OK to ' + configuration.fallbackLanguage + '.json', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      global.fetch = jest.fn().mockImplementation((url: string) => {
        const endPointUrl = configuration3.endPointUrl + configuration3.language + '.json';
        const localLangUrl = configuration3.language + '.json';
        countCall++;
        latestUrls.push(url);
        if (endPointUrl === url) {
          // fail with fr on endPoint
          return Promise.reject(mockFailApiResponse());
        } else if (localLangUrl === url) {
          // success if fr local
          return Promise.reject(mockFailApiResponse());
        }
        return Promise.resolve(mockSuccessApiResponse(responseEN));
      });

      jest.spyOn(translationsLoader, 'getTranslationFromLocal');

      const subscription = translationsLoader.getTranslation(configuration3.language).subscribe((res) => {
        expect(countCall).toBe(3);

        expect(latestUrls[0]).toEqual(configuration3.endPointUrl + configuration3.language + '.json');

        expect(latestUrls[1]).toEqual(configuration3.language + '.json');

        expect(latestUrls[2]).toEqual(configuration3.fallbackLanguage + '.json');

        expect(res).toBeDefined();

        expect(res).toEqual(responseEN);

        subscription.unsubscribe();
        done();
      });
    });
  });

  describe('With queryParams', () => {
    it('performs fetch with one parameter', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      const configWithParams = Object.assign({}, configuration3, { queryParams: { SITECODE: 'XDEFXDEF' } });
      translationsLoader = new TranslationsLoader(configWithParams);
      global.fetch = jest.fn().mockImplementation((url: string) => {
        countCall++;
        latestUrls.push(url);
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });
      const subscription = translationsLoader.getTranslation(configWithParams.language).subscribe((res) => {
        // get the fr.json
        expect(res).toEqual(responseFR);
        // 1 call
        expect(countCall).toBe(1);
        // check the query URL
        expect(latestUrls[0]).toBe(configWithParams.endPointUrl + configWithParams.language + '.json?SITECODE=XDEFXDEF');
        subscription.unsubscribe();
        done();
      });
    });

    it('performs fetch with several parameters', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      const configWithParams = Object.assign({}, configuration3, { queryParams: { SITECODE: 'XDEFXDEF', OFFICEID: 'ANNCEPAR29MAY' } });
      translationsLoader = new TranslationsLoader(configWithParams);
      global.fetch = jest.fn().mockImplementation((url: string) => {
        countCall++;
        latestUrls.push(url);
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });
      const subscription = translationsLoader.getTranslation(configWithParams.language).subscribe((res) => {
        // get the fr.json
        expect(res).toEqual(responseFR);
        // 1 call
        expect(countCall).toBe(1);
        // check the query URL
        expect(latestUrls[0]).toBe(configWithParams.endPointUrl + configWithParams.language + '.json?SITECODE=XDEFXDEF&OFFICEID=ANNCEPAR29MAY');
        subscription.unsubscribe();
        done();
      });
    });

    it('performs fetch with encoded parameters', (done) => {
      let countCall = 0;
      const latestUrls: string[] = [];
      const configWithParams = Object.assign({}, configuration3, { queryParams: { 'SITE CODE': 'XDEF DEF' } });
      translationsLoader = new TranslationsLoader(configWithParams);
      global.fetch = jest.fn().mockImplementation((url: string) => {
        countCall++;
        latestUrls.push(url);
        return Promise.resolve(mockSuccessApiResponse(responseFR));
      });
      const subscription = translationsLoader.getTranslation(configWithParams.language).subscribe((res) => {
        // get the fr.json
        expect(res).toEqual(responseFR);
        // 1 call
        expect(countCall).toBe(1);
        // check the query URL
        expect(latestUrls[0]).toBe(configWithParams.endPointUrl + configWithParams.language + '.json?SITE%20CODE=XDEF%20DEF');
        subscription.unsubscribe();
        done();
      });
    });
  });
});
