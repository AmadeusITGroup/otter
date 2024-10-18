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
  getMetadataTokenDefinitionRenderer
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
    const renderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toContain('test-var');
    expect(result).toContain('test-value');
  });

  describe('in case of private variable', () => {
    const privateVariable = 'example.var1-private';

    test('should render it per default', () => {
      const tokenValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
      const renderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer });
      const variable = designTokens.get(privateVariable);

      const result = renderer(variable, designTokens);
      expect(variable).toBeDefined();
      expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result).toContain('test-var');
      expect(result).toContain('test-value');
    });

    test('should not render it when required', () => {
      const tokenValueRenderer = jest.fn().mockReturnValue(JSON.stringify({ name: 'test-var', value: 'test-value' }));
      const renderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer, ignorePrivateVariable: true });
      const variable = designTokens.get(privateVariable);

      const result = renderer(variable, designTokens);
      expect(variable).toBeDefined();
      expect(tokenValueRenderer).not.toHaveBeenCalled();
      expect(result).not.toBeDefined();
    });
  });

  test('should render valid JSON object', () => {
    const renderer = getMetadataTokenDefinitionRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(() => JSON.parse(`{${result}}`)).not.toThrow();
  });
});
