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
  getJsonSchemaTokenValueRenderer,
} from './design-token-value.renderers';

describe('getJsonSchemaTokenValueRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should rely on given UrlRenderer', () => {
    const referenceUrlRenderer = jest.fn().mockImplementation((tokenType = 'default') => `https://test-${tokenType}`);
    const renderer = getJsonSchemaTokenValueRenderer({ referenceUrlRenderer });
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(referenceUrlRenderer).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();
    expect(result).toContain('https://test-default');
    expect(result).toContain('https://test-color');
  });

  test('should render valid JSON object', () => {
    const renderer = getJsonSchemaTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
