import {
  resolve
} from 'node:path';
import {
  compileString,
  Logger
} from 'sass';

const url = new URL('.', 'file://' + resolve(__dirname, 'test.scss'));
const testedFile = './functions';

describe('Utils function', () => {
  describe('multi-map-merge', () => {
    it('should merge the list of map into one map', () => {
      const spy = jest.fn();
      const logger: Logger = {
        debug: (message) => spy(message)
      };
      const mock = `@use '${testedFile}' as o3r;
        $res: o3r.multi-map-merge((a: 'a'), (b: 'b'), (a: 'c'));
        @debug $res;`;
      compileString(mock, { url, logger });
      expect(spy).toHaveBeenCalledWith('(a: "c", b: "b")');
    });

    it('should return empty if called without arguments', () => {
      const spy = jest.fn();
      const logger: Logger = {
        debug: (message) => spy(message)
      };
      const mock = `@use '${testedFile}' as o3r;
        $res: o3r.multi-map-merge();
        @debug $res;`;
      compileString(mock, { url, logger });
      expect(spy).toHaveBeenCalledWith('()');
    });
  });

  describe('get-mandatory', () => {
    it('should return the requested key value', () => {
      const spy = jest.fn();
      const logger: Logger = {
        debug: (message) => spy(message)
      };
      const mock = `@use '${testedFile}' as o3r;
        $res: o3r.get-mandatory((test: 'test-value'), test, 'map');
        @debug $res;`;
      compileString(mock, { url, logger });
      expect(spy).toHaveBeenCalledWith('test-value');
    });

    it('should fail if the key is no included in the map', () => {
      const mock = `@use '${testedFile}' as o3r;
        $res: o3r.get-mandatory((test: 'test-value'), missing-key, 'map');
        @debug $res;`;
      expect(() => compileString(mock, { url })).toThrow(
        expect.objectContaining({ message: expect.stringContaining('"Missing mandatory `missing-key` in `map`"') })
      );
    });
  });
});
