import {
  resolve,
} from 'node:path';
import {
  Logger,
} from 'sass';
import {
  CssVariableExtractor,
} from './css-variable.extractor';

const file = resolve(__dirname, '..', '..', '..', 'test.scss');
const url = new URL('.', 'file://' + file);
const testedFile = './scss/theming/mixins';
const logger = Logger.silent;

describe('CSS Variable extractor', () => {
  describe('Sass file content parsing', () => {
    test('should correctly extract variable details', () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('my-var', #fff, (category: 'test category'));
        }
      `;

      const parser = new CssVariableExtractor({ logger });
      const variables = parser.extractFileContent(file, mock, { url });
      expect(variables).toHaveLength(1);
      expect(variables[0]).toEqual(expect.objectContaining({ name: 'my-var', defaultValue: 'rgba(255, 255, 255, 1)', category: 'test category' }));
    });

    test('should override variable details', () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('my-var', #fff, (category: 'test category'));
          @include o3r.var('my-var', null, (category: 'new category'));
        }
      `;

      const parser = new CssVariableExtractor({ logger });
      const variables = parser.extractFileContent(file, mock, { url });
      expect(variables).toHaveLength(1);
      expect(variables[0]).toEqual(expect.objectContaining({ name: 'my-var', defaultValue: 'rgba(255, 255, 255, 1)', category: 'new category' }));
    });
  });
});
