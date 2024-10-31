import {
  promises as fs
} from 'node:fs';
import {
  resolve
} from 'node:path';
import type {
  DesignTokenSpecification
} from '../../design-token-specification.interface';
import type {
  DesignTokenVariableSet
} from '../../parsers';
import * as parser from '../../parsers/design-token.parser';
import {
  getDesignTokenTokenValueRenderer
} from './design-token-value.renderers';

describe('getDesignTokenTokenValueRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should render valid JSON object', () => {
    const renderer = getDesignTokenTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('should render token with original value', () => {
    const renderer = getDesignTokenTokenValueRenderer();

    const variable1 = designTokens.get('example.var1');
    const result1 = renderer(variable1, designTokens);
    const resObject1 = JSON.parse(result1);

    const variable2 = designTokens.get('example.color');
    const result2 = renderer(variable2, designTokens);
    const resObject2 = JSON.parse(result2);

    expect(resObject1.$value).toBe('#000');
    expect(resObject1.$type).toBe('color');
    expect(resObject2.$type).not.toBeDefined();
    expect(resObject2.$value).toBe('{example.var1}');
  });

  test('should inherit of parent properties', () => {
    const renderer = getDesignTokenTokenValueRenderer();

    const variable = designTokens.get('inherit.var');
    const result = renderer(variable, designTokens);
    const resObject = JSON.parse(result);

    expect(resObject.$value).toBe('{example.var1}');
    expect(resObject.$extensions).toBeDefined();
    expect(resObject.$extensions.o3rScope).toBe('test-scope');
  });
});
