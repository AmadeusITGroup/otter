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
  getDesignTokenTokenDefinitionRenderer
} from './design-token-definition.renderers';

describe('getDesignTokenTokenDefinitionRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should rely on given tokenValueRenderer', () => {
    const tokenValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
    const renderer = getDesignTokenTokenDefinitionRenderer({ tokenValueRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toContain('test-var');
    expect(result).toContain('test-value');
  });

  test('should render valid JSON object', () => {
    const renderer = getDesignTokenTokenDefinitionRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('should render deep object without keyLevel', () => {
    const renderer = getDesignTokenTokenDefinitionRenderer();
    const variable = designTokens.get('inherit.deeper.super-deeper.var');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(JSON.parse(result).inherit.deeper['super-deeper'].var).toBeDefined();
  });

  test('should render deep object with keyLevel', () => {
    const renderer = getDesignTokenTokenDefinitionRenderer({ keyJoinNumber: 2 });
    const variable = designTokens.get('inherit.deeper.super-deeper.var');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(JSON.parse(result)['inherit.deeper.super-deeper'].var).toBeDefined();
  });
  test('should render deep object with keyLevel overflow', () => {
    const renderer = getDesignTokenTokenDefinitionRenderer({ keyJoinNumber: 10 });
    const variable = designTokens.get('inherit.deeper.super-deeper.var');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(JSON.parse(result)['inherit.deeper.super-deeper.var']).toBeDefined();
  });
});
