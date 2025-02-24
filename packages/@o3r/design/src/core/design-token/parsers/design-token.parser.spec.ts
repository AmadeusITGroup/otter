import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import type {
  DesignTokenGroupTemplate,
  DesignTokenSpecification,
} from '../design-token-specification.interface';
import * as parser from './design-token.parser';

describe('Design Token Parser', () => {
  let exampleVariable!: DesignTokenSpecification;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
  });

  describe('parseDesignToken', () => {
    test('should support single root key', () => {
      const result = parser.parseDesignToken({
        document: {
          'my.variable': {
            $value: '{external}'
          }
        }
      });
      const var1 = result.get('my.variable');
      const var2 = result.get('.my.variable');

      expect(result.size).toBe(1);
      expect(var2).not.toBeDefined();
      expect(var1).toBeDefined();
      expect(var1.getKey()).toBe('my-variable');
    });

    test('should generate a simple type variable', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const var1 = result.get('example.var1');
      const varString = result.get('example.var-string');
      const var2 = result.get('example.test.var2');

      expect(result.size).toBeGreaterThan(0);
      expect(var2).toBeDefined();
      expect(var1).toBeDefined();
      expect(varString).toBeDefined();
      expect(var2.getKey()).toBe('example-test-var2');
      expect(var1.getKey()).toBe('example-var1');
      expect(var2.description).toBe('my var2');
      expect(var2.getType()).toBe('color');
      expect(var1.getType()).toBe('color');
      expect(varString.getType()).toBe('string');
      expect(varString.getCssRawValue()).toBe('"test value"');
    });

    test('should generate an alias variable', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const color = result.get('example.color');

      expect(color).toBeDefined();
      expect(color.getType()).toBe('color');
    });

    describe('with template set', () => {
      let exampleVariableWithContext!: DesignTokenSpecification;

      beforeEach(() => {
        const template: DesignTokenGroupTemplate = {
          example: {
            $extensions: {
              o3rImportant: true
            }
          }
        };
        exampleVariableWithContext = {
          ...exampleVariable,
          context: {
            template
          }
        };
      });

      test('should generate a variable with template', () => {
        const result = parser.parseDesignToken(exampleVariableWithContext);
        const item = result.get('example.var1-private');

        expect(item).toBeDefined();
        expect(item.extensions.o3rImportant).toBe(true);
        expect(item.extensions.o3rPrivate).toBe(true);
      });

      test('should generate a variable with template override', () => {
        const result = parser.parseDesignToken(exampleVariableWithContext);
        const item = result.get('example.var-not-important');

        expect(item).toBeDefined();
        expect(item.extensions.o3rImportant).toBe(false);
      });

      test('should generate a variable with template when the token matches star', () => {
        const result = parser.parseDesignToken({
          ...exampleVariableWithContext,
          context: {
            template: {
              example: {
                '*': {
                  $extensions: {
                    o3rImportant: true
                  }
                }
              }
            } as DesignTokenGroupTemplate
          }
        });
        const item = result.get('example.var1');

        expect(item).toBeDefined();
        expect(item.extensions.o3rImportant).toBe(true);
        expect(item.extensions.o3rPrivate).toBeFalsy();
      });

      test('should explode complex type', () => {
        const result = parser.parseDesignToken({
          ...exampleVariableWithContext,
          context: {
            template: {
              example: {
                test: {
                  $extensions: {
                    o3rExplodeComplexTypes: true
                  }
                }
              }
            } as DesignTokenGroupTemplate
          }
        });
        const borderColor = result.get('example.test.border.color');
        const borderStyle = result.get('example.test.border.style');
        const borderWidth = result.get('example.test.border.width');
        const shadowFirstBlur = result.get('example.test.shadow-multi.0.blur');
        const shadowSecondBlur = result.get('example.test.shadow-multi.1.blur');
        const shadowBlur = result.get('example.test.shadow-multi.blur');

        expect(borderColor).toBeDefined();
        expect(borderStyle).toBeDefined();
        expect(borderWidth).toBeDefined();
        expect(shadowFirstBlur).toBeDefined();
        expect(shadowSecondBlur).toBeDefined();
        expect(shadowBlur).not.toBeDefined();
      });

      test('should explode complex type without overriding existing token', () => {
        const result = parser.parseDesignToken({
          ...exampleVariableWithContext,
          context: {
            template: {
              example: {
                test: {
                  $extensions: {
                    o3rExplodeComplexTypes: true
                  }
                }
              }
            } as DesignTokenGroupTemplate
          }
        });
        const borderColor = result.get('example.test.border.color');
        const borderStyle = result.get('example.test.border.style');

        expect(borderColor.getCssRawValue()).toBe('silver');
        expect(borderStyle.getCssRawValue()).toBe('dashed');
      });
    });

    test('should generate a complex variable', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const border = result.get('example.test.border');

      expect(border).toBeDefined();
      expect(border.getType()).toBe('border');
    });

    test('should generate a complex typography', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const typography = result.get('example.typography');

      expect(typography).toBeDefined();
      expect(typography.getCssRawValue()).toBe('300 big spacing normal la-familia');
    });

    test('should generate correctly the gradient', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const gradient = result.get('example.test.gradient');

      expect(gradient).toBeDefined();
      expect(gradient.getType()).toBe('gradient');
      expect(gradient.getCssRawValue()).toBe('linear-gradient(180deg, #fff 10px)');
    });

    test('should generate correctly the border', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const border = result.get('example.test.border-complex');

      expect(border).toBeDefined();
      expect(border.getType()).toBe('border');
      expect(border.getCssRawValue()).toBe('2px square 1px red');
    });

    test('should generate correctly the store style', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const stroke = result.get('example.test.stroke');

      expect(stroke).toBeDefined();
      expect(stroke.getCssRawValue()).toBe('dotted');
    });

    test('should generate correctly the store complex style', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const stroke = result.get('example.test.stroke-complex');

      expect(stroke).toBeDefined();
      expect(stroke.getCssRawValue()).toBe('round 2px');
    });

    describe('should generate correctly the shadow', () => {
      test('with single parameter', () => {
        const result = parser.parseDesignToken(exampleVariable);
        const shadow = result.get('example.test.shadow');

        expect(shadow).toBeDefined();
        expect(shadow.getType()).toBe('shadow');
        expect(shadow.getCssRawValue()).toBe('1px 1px 1  1 #000');
      });

      test('with dimension parameter', () => {
        const result = parser.parseDesignToken(exampleVariable);
        const shadow = result.get('example.test.shadow-dimension');

        expect(shadow).toBeDefined();
        expect(shadow.getType()).toBe('shadow');
        expect(shadow.getCssRawValue()).toBe('1px 1px 1  1 #000');
      });

      test('with multiple parameter', () => {
        const result = parser.parseDesignToken(exampleVariable);
        const shadow = result.get('example.test.shadow-multi');

        expect(shadow).toBeDefined();
        expect(shadow.getType()).toBe('shadow');
        expect(shadow.getCssRawValue()).toBe('inset 1px 1px 1  1 #000, 2px 2px 2  2 #fff');
      });
    });
  });

  describe('parseDesignTokenFile', () => {
    afterEach(() => jest.resetAllMocks());

    test('should read the file according to the reader', async () => {
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", "$type": "color" }}');
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));
      const result = await parser.parseDesignTokenFile('fakeFile.json', { readFile });

      expect(result.size).toBe(0);
      expect(parseDesignToken).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(parseDesignToken).toHaveBeenCalledWith({ context: { basePath: '.' }, document: { test: { $value: '#000', $type: 'color' } } });
    });

    test('should read file from URL', async () => {
      const content = { test: { $value: '#000', $type: 'color' } };
      jest.spyOn(global, 'fetch').mockImplementation(
        jest.fn(
          () => Promise.resolve({
            text: () => Promise.resolve(JSON.stringify(content))
          })
        ) as jest.Mock
      );
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));
      const url = 'https://www.google.com';
      const result = await parser.parseDesignTokenFile(url);

      expect(result.size).toBe(0);
      expect(parseDesignToken).toHaveBeenCalledWith(expect.objectContaining({ document: content }));
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should read file from FS', async () => {
      const content = { test: { $value: '#000', $type: 'color' } };
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", "$type": "color" }}');
      jest.mock('node:fs/promises', () => ({
        readFile
      }));
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));
      const file = '/the/file.json';
      const result = await parser.parseDesignTokenFile(file);

      expect(result.size).toBe(0);
      expect(parseDesignToken).toHaveBeenLastCalledWith(expect.objectContaining({ document: content }));
      expect(readFile).toHaveBeenCalledTimes(1);
    });

    test('should propagate context object', async () => {
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", "$type": "color" }}');
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));
      await parser.parseDesignTokenFile('fakeFile.json', { readFile, specificationContext: { template: { $description: 'test' } } });

      expect(parseDesignToken).toHaveBeenCalledWith({ context: { basePath: '.', template: { $description: 'test' } }, document: { test: { $value: '#000', $type: 'color' } } });
    });

    test('should throw if invalid JSON Token', async () => {
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", ');
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));

      await expect(() => parser.parseDesignTokenFile('fakeFile.json', { readFile })).rejects.toThrow();
      expect(parseDesignToken).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
    });
  });
});
