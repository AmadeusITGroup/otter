import * as parser from './design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../design-token-specification.interface';

describe('Design Token Parser', () => {

  let exampleVariable!: DesignTokenSpecification;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = {document: JSON.parse(file)};
  });

  describe('parseDesignToken', () => {

    test('generate a simple type variable', () => {
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

    test('generate an alias variable', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const color = result.get('example.color');

      expect(color).toBeDefined();
      expect(color.getType()).toBe('color');
    });

    test('generate a complex variable', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const border = result.get('example.test.border');

      expect(border).toBeDefined();
      expect(border.getType()).toBe('border');
    });

    test('generate correctly the gradient', () => {
      const result = parser.parseDesignToken(exampleVariable);
      const gradient = result.get('example.test.gradient');

      expect(gradient).toBeDefined();
      expect(gradient.getType()).toBe('gradient');
      expect(gradient.getCssRawValue()).toBe('linear-gradient(180deg, #fff 10px)');
    });

    describe('generate correctly the shadow', () => {
      test('with single parameter', () => {
        const result = parser.parseDesignToken(exampleVariable);
        const shadow = result.get('example.test.shadow');

        expect(shadow).toBeDefined();
        expect(shadow.getType()).toBe('shadow');
        expect(shadow.getCssRawValue()).toBe('1px 1px 1  1 #000');
      });

      test('with multiple parameter', () => {
        const result = parser.parseDesignToken(exampleVariable);
        const shadow = result.get('example.test.shadow-multi');

        expect(shadow).toBeDefined();
        expect(shadow.getType()).toBe('shadow');
        expect(shadow.getCssRawValue()).toBe('1px 1px 1  1 #000, 2px 2px 2  2 #fff');
      });
    });
  });

  describe('parseDesignTokenFile', () => {
    test('should read the file according to the reader', async () => {
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", "$type": "color" }}');
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));
      const result = await parser.parseDesignTokenFile('fakeFile.json', {readFile});

      expect(result.size).toBe(0);
      expect(parseDesignToken).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(parseDesignToken).toHaveBeenCalledWith({context: { basePath: '.' }, document: { test: { $value: '#000', $type: 'color' } } });
    });

    test('should throw if invalid JSON Token', async () => {
      const readFile = jest.fn().mockResolvedValue('{"test": { "$value": "#000", ');
      const parseDesignToken = jest.spyOn(parser, 'parseDesignToken').mockImplementation(() => (new Map()));

      await expect(() => parser.parseDesignTokenFile('fakeFile.json', {readFile})).rejects.toThrow();
      expect(parseDesignToken).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
    });
  });
});
