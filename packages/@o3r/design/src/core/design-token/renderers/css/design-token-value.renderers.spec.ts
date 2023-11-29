import * as parser from '../../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../../parsers';
import { getCssTokenValueRenderer } from './design-token-value.renderers';

describe('getCssTokenValueRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = JSON.parse(file);
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should render valid CSS value', () => {
    const renderer = getCssTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe((exampleVariable as any).example.var1.$value);
  });

  test('should render valid CSS var', () => {
    const renderer = getCssTokenValueRenderer();
    const variable = designTokens.get('example.color');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe('var(--example-var1)');
  });

  test('should render valid CSS var of not print value', () => {
    const renderer = getCssTokenValueRenderer();
    const variable = designTokens.get('example.color2');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe(`var(--example-var3, ${(exampleVariable as any).example.var3.$value})`);
  });
});
