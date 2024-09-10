import * as parser from '../../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../../parsers';
import { getMetadataTokenValueRenderer } from './design-token-value.renderers';

describe('getMetadataTokenValueRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should rely on given cssValueRenderer', () => {
    const cssValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
    const renderer = getMetadataTokenValueRenderer({ cssValueRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(cssValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toContain('test-var');
    expect(result).toContain('test-value');
  });

  test('should render valid JSON object', () => {
    const renderer = getMetadataTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(() => JSON.parse(result)).not.toThrow();
  });

  test('should correctly remove private variables from generation', () => {
    const renderer = getMetadataTokenValueRenderer({ignorePrivateVariable: true});
    const variable = designTokens.get('example.var-private-ref-to-public-var');

    const result = renderer(variable, designTokens);
    const metadata = JSON.parse(result);
    expect(result).toBeDefined();
    expect(metadata).toBeDefined();
    expect(metadata.references.length).toBe(1);
    expect(metadata.references[0].name).toBe('example-var1');
  });
});
