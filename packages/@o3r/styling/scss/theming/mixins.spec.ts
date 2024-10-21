import {
  resolve
} from 'node:path';
import {
  compileString
} from 'sass';

const url = new URL('.', 'file://' + resolve(__dirname, 'test.scss'));
const testedFile = './mixins';

describe('Theming mixins', () => {
  describe('var', () => {
    it('should define new variable', () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('test-color-1', #000, (description: 'test description'));
          @include o3r.var('--test-color-2', #fff, (description: 'test description'));
        }`;
      const result = compileString(mock, { url });
      expect(result.css.replaceAll(/\s+/g, '')).toEqual(':root{--test-color-1:#000;--test-color-2:#fff;}');
    });

    it('should override previous metadata', () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('test-color-1', #000, (description: 'test description'));
          @include o3r.var('test-color-1', #fff, (description: 'new description'));
        }`;
      const result = compileString(mock, { url });
      expect(result.css.replaceAll(/\s+/g, '')).toEqual(':root{--test-color-1:#000;--test-color-1:#fff;}');
    });

    it('should not generate null variable', () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('test-color-1', #000, (description: 'test description'));
          @include o3r.var('test-color-1', null, (description: 'new description'));
        }`;
      const result = compileString(mock, { url });
      expect(result.css.replaceAll(/\s+/g, '')).toEqual(':root{--test-color-1:#000;}');
    });
  });
});
