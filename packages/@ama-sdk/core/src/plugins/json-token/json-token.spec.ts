import {
  ApiTypes
} from '../../fwk/api';
import {
  RequestOptions
} from '../core/request-plugin';
import {
  JsonTokenReply
} from './json-token.reply';
import {
  JsonTokenRequest
} from './json-token.request';

describe('Json Token', () => {
  const tokenValue = 'tokenValue';
  const tokenKey = 'testToken';

  describe('request plugin', () => {
    const defaultGetParams = { defaultTest: 'ok' };
    const defaultBody = 'default';
    let options: RequestOptions;

    beforeEach(() => {
      options = {
        method: 'get',
        queryParams: defaultGetParams,
        headers: new Headers(),
        body: defaultBody,
        basePath: 'http://test.com/truc'
      };
    });

    it('should add Authorization header', async () => {
      const memory = { testToken: tokenValue };
      const plugin = new JsonTokenRequest(tokenKey, memory);
      const runner = plugin.load();

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => tokenValue);
      }

      const result = await runner.transform(options);

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        expect(window.sessionStorage.getItem).toHaveBeenCalledWith(tokenKey);
      }

      expect(result.credentials).toBe('same-origin');
      expect(result.headers.get('Authorization')).toBe(tokenValue);
    });

    it('should not add Authorization if no token', async () => {
      const memory = { testToken: undefined };
      const plugin = new JsonTokenRequest(tokenKey, memory);
      const runner = plugin.load();

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        jest.spyOn(window.sessionStorage, 'getItem').mockImplementation();
      }

      const result = await runner.transform(options);

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        expect(window.sessionStorage.getItem).toHaveBeenCalledWith(tokenKey);
      }

      expect(result.credentials).toBeUndefined();
      expect(result.headers.get('Authorization')).toBeNull();
    });
  });

  describe('reply plugin', () => {
    const reviver = jest.fn();

    it('should store the received token', async () => {
      const memory = { testToken: undefined };
      const plugin = new JsonTokenReply(tokenKey, memory);
      const runner = plugin.load({
        reviver,
        apiType: ApiTypes.DEFAULT,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        response: { headers: new Headers({ Authorization: tokenValue }) } as any
      });
      const data = {};

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        jest.spyOn(window.sessionStorage, 'setItem').mockImplementation();
      }

      await runner.transform(data);

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(tokenKey, tokenValue);
      } else {
        expect(memory.testToken).toBe(tokenValue);
      }
    });
  });
});
