import * as parser from '../../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../../parsers';
import { getSassTokenDefinitionRenderer } from './design-token-definition.renderers';

describe('getSassTokenDefinitionRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should rely on given tokenValueRenderer', () => {
    const tokenValueRenderer = jest.fn().mockReturnValue('test-value');
    const renderer = getSassTokenDefinitionRenderer({ tokenValueRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toBe('$exampleVar1: test-value;');
  });

  test('should prefix private variable', () => {
    const tokenValueRenderer = jest.fn().mockReturnValue('test-value');
    const renderer = getSassTokenDefinitionRenderer({ tokenValueRenderer, isPrivateVariable: (v) => v.tokenReferenceName === 'example.var1'});
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toBe('$_exampleVar1: test-value;');
  });
});
