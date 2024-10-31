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
  DesignTokenVariableSet,
  TokenKeyRenderer
} from '../../parsers';
import * as parser from '../../parsers/design-token.parser';
import {
  getSassTokenDefinitionRenderer,
  tokenVariableNameSassRenderer
} from './design-token-definition.renderers';

describe('getSassTokenDefinitionRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
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
    expect(result).toBe('$example-var1: test-value;');
  });

  test('should prefix private variable', () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping -- linked to this test only
    const tokenVariableNameRenderer: TokenKeyRenderer = (v) => '_' + tokenVariableNameSassRenderer(v);

    const options = { tokenVariableNameRenderer };
    const tokenValueRenderer = jest.spyOn(options, 'tokenVariableNameRenderer');
    const renderer = getSassTokenDefinitionRenderer(options);
    const variable = designTokens.get('example.var1-private');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(tokenValueRenderer).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
    expect(result).toBe('$_example-var1-private: var(--example-var1-private, #000);');
  });
});
