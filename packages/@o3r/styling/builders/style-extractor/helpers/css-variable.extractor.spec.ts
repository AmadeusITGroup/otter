import {
  resolve,
} from 'node:path';
import {
  CalculationInterpolation,
  CalculationOperation,
  Logger,
  SassNumber,
  SassString,
} from 'sass-embedded';
import {
  CssVariableExtractor,
  getVarDeclaration,
} from './css-variable.extractor';

const file = resolve(__dirname, '..', '..', '..', 'test.scss');
const url = new URL('.', 'file://' + file);
const testedFile = './scss/theming/mixins';
const logger = Logger.silent;

describe('CSS Variable extractor', () => {
  describe('Sass file content parsing', () => {
    test('should correctly extract variable details', async () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('my-color', #fff, (
            category: 'test category',
            description: 'test description',
            type: 'color',
            label: 'My Color',
            tags: ['tag1', 'tag2'],
            unsupportedProperty: 'color'
          ));
          @include o3r.var('my-color-with-alpha', #ffffff00, (
            category: 'test category',
            tags: 'tag1'
          ));
          @include o3r.var('my-truthy-boolean', true, ());
          @include o3r.var('my-falsy-boolean', false, ());
          @include o3r.var('my-string', 'test', ());
          @include o3r.var('my-calc', calc(3 * (2px + 1rem)), ());
          @include o3r.var('my-complex-calc', calc(3 * calc(2px + 1rem)), ());
          @include o3r.var('my-list', #fff 0 calc(3 * (2px + 1rem)) true false, ());
          @include o3r.var('my-list-with-invalid-values', null 0, ());
          @include o3r.var('my-null-var', null, ());
        }
      `;

      const parser = new CssVariableExtractor({ logger });
      const variables = await parser.extractFileContent(file, mock, { url });
      expect(variables).toHaveLength(9);
      expect(variables[0]).toEqual(expect.objectContaining({
        name: 'my-color',
        defaultValue: 'rgb(255, 255, 255)',
        category: 'test category',
        description: 'test description',
        type: 'color',
        label: 'My Color',
        tags: ['tag1', 'tag2']
      }));
      expect(variables[1]).toEqual(expect.objectContaining({
        name: 'my-color-with-alpha',
        defaultValue: 'rgba(255, 255, 255, 0)',
        category: 'test category',
        tags: ['tag1']
      }));
      expect(variables[2]).toEqual(expect.objectContaining({ name: 'my-truthy-boolean', defaultValue: 'true' }));
      expect(variables[3]).toEqual(expect.objectContaining({ name: 'my-falsy-boolean', defaultValue: 'false' }));
      expect(variables[4]).toEqual(expect.objectContaining({ name: 'my-string', defaultValue: '"test"' }));
      expect(variables[5]).toEqual(expect.objectContaining({ name: 'my-calc', defaultValue: 'calc(3 * (2px + 1rem))' }));
      expect(variables[6]).toEqual(expect.objectContaining({ name: 'my-complex-calc', defaultValue: 'calc(3 * (2px + 1rem))' }));
      expect(variables[7]).toEqual(expect.objectContaining({ name: 'my-list', defaultValue: 'rgb(255, 255, 255) 0 calc(3 * (2px + 1rem)) true false' }));
      expect(variables[8]).toEqual(expect.objectContaining({ name: 'my-list-with-invalid-values', defaultValue: '0' }));
    });

    test('should override variable details', async () => {
      const mock = `@use '${testedFile}' as o3r;
        :root {
          @include o3r.var('my-var', #fff, (category: 'test category'));
          @include o3r.var('my-var', null, (category: 'new category'));
        }
      `;

      const parser = new CssVariableExtractor({ logger });
      const variables = await parser.extractFileContent(file, mock, { url });
      expect(variables).toHaveLength(1);
      expect(variables[0]).toEqual(expect.objectContaining({ name: 'my-var', defaultValue: 'rgb(255, 255, 255)', category: 'new category' }));
    });
  });

  describe('getVarDeclaration', () => {
    test('should return the var declaration', () => {
      expect(getVarDeclaration('var(--my-var, #fff)')).toEqual('var(--my-var, #fff)');
    });

    test('should return the var declaration with another var as default value', () => {
      expect(getVarDeclaration('var(--my-var, var(--my-color, #fff))')).toEqual('var(--my-var, var(--my-color, #fff))');
    });

    test('should return the complete string from starting position when the var declaration is not closed', () => {
      expect(getVarDeclaration('var(--my-var, var(--my-color, #fff)')).toEqual('var(--my-var, var(--my-color, #fff)');
    });

    test('should return the var declaration when string is not starting with var', () => {
      expect(getVarDeclaration('0 0 var(--my-var, #fff) 0')).toEqual('var(--my-var, #fff)');
    });

    test('should return null when there is no var declaration', () => {
      expect(getVarDeclaration('0 0 #fff 0')).toBeNull();
    });
  });

  describe('getCalcString', () => {
    test('should return a string representing the sass number with unit', () => {
      const sassObj = new SassNumber(2, 'px');
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('2px');
    });

    test('should return a string representing the sass number without unit', () => {
      const sassObj = new SassNumber(2);
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('2');
    });

    test('should return a string representing the sass string', () => {
      const sassObj = new SassString('text');
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('text');
    });

    test('should return a string representing the sass calculation operation', () => {
      const sassObj = new CalculationOperation('+', new SassNumber(1), new SassNumber(2));
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('1 + 2');
    });

    test('should return a string representing the sass calculation operation (sub calculation version)', () => {
      const sassObj = new CalculationOperation('+', new SassNumber(1), new SassNumber(2));
      expect(CssVariableExtractor.getCalcString(sassObj, true)).toEqual('(1 + 2)');
    });

    test('should return a string representing the sass calculation operation (complex calculation version)', () => {
      const sassObj = new CalculationOperation('*', new SassNumber(3), new CalculationOperation('+', new SassNumber(2), new SassNumber(1)));
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('3 * (2 + 1)');
    });

    test('should return a string representing the sass calculation interpolation (complex calculation version)', () => {
      const sassObj = new CalculationInterpolation('(3 * (2 + 1))');
      expect(CssVariableExtractor.getCalcString(sassObj, false)).toEqual('(3 * (2 + 1))');
    });
  });
});
