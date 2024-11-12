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
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should render valid CSS value', () => {
    const renderer = getCssTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe((exampleVariable.document as any).example.var1.$value);
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
    expect(result).toBe(`var(--example-var3, ${(exampleVariable.document as any).example.var3.$value})`);
  });

  test('should render invalid reference and raise warning', () => {
    const debug = jest.fn();
    const renderer = getCssTokenValueRenderer({ logger: { debug }} as any);
    const variable = designTokens.get('example.wrong-ref');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('does.not.exist'));
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('var(--does-not-exist)'));
    expect(result).toBe('var(--does-not-exist)');
  });
});
