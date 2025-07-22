import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import type {
  DesignTokenSpecification,
} from '../../design-token-specification.interface';
import type {
  DesignTokenVariableSet,
} from '../../parsers';
import * as parser from '../../parsers/design-token.parser';
import {
  getCssTokenDefinitionRenderer,
} from './design-token-definition.renderers';

describe('getMetadataTokenDefinitionRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should rely on given tokenValueRenderer', () => {
    const tokenValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
    const renderer = getCssTokenDefinitionRenderer({ tokenValueRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toContain('test-var');
    expect(result).toContain('test-value');
  });

  test('should use private renderer for private variable', () => {
    const variable = designTokens.get('example.var3');
    const privateDefinitionRenderer = jest.fn().mockImplementation((v: any) => `$test: ${v.getCssRawValue()}`);

    const renderer1 = getCssTokenDefinitionRenderer();
    const renderer2 = getCssTokenDefinitionRenderer({ privateDefinitionRenderer });
    const result1 = renderer1(variable, designTokens);

    expect(variable).toBeDefined();
    expect(result1).not.toBeDefined();
    expect(privateDefinitionRenderer).toHaveBeenCalledTimes(0);

    const result2 = renderer2(variable, designTokens);

    expect(result2).toContain('$test');
    expect(privateDefinitionRenderer).toHaveBeenCalledTimes(1);
  });

  test('should enforce reference when expecting override', () => {
    const tokenValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
    const renderer = getCssTokenDefinitionRenderer({ tokenValueRenderer });
    const variable = designTokens.get('example.var-expect-override');

    renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(tokenValueRenderer).toHaveBeenCalledWith(expect.objectContaining({}), expect.objectContaining({}), true);
  });
});
