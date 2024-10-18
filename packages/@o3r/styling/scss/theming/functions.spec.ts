import {
  resolve
} from 'node:path';
import {
  compileString
} from 'sass';

const url = new URL('.', 'file://' + resolve(__dirname, 'test.scss'));
const testedFile = './functions';

describe('Theming functions', () => {
  describe('var', () => {
    it('should define new variable', () => {
      const mock = `@use '${testedFile}' as o3r;
        $myVar1: o3r.var('test-color-1', #000, (description: 'test description'));
        $myVar2: o3r.var('--test-color-2', #fff, (description: 'test description'));
        body {
          background-color: $myVar1;
          color: $myVar2;
        }`;
      const result = compileString(mock, { url });
      expect(result.css.replaceAll(/[\n\r\s]/g, '')).toEqual('body{background-color:var(--test-color-1,#000);color:var(--test-color-2,#fff);}');
    });

    it('should define new complex variable', () => {
      const mock = `@use '${testedFile}' as o3r;
        $myVar1: o3r.var('test-color-1', o3r.var('test-color-2'), (description: 'test description'));
        body {
          background-color: $myVar1;
        }`;
      const result = compileString(mock, { url });
      expect(result.css.replaceAll(/[\n\r\s]/g, '')).toEqual('body{background-color:var(--test-color-1,var(--test-color-2));}');
    });
  });
});
