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
  getSassTokenValueRenderer
} from './design-token-value.renderers';

describe('getSassTokenValueRenderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should render valid Scss value', () => {
    const renderer = getSassTokenValueRenderer();
    const variable = designTokens.get('example.var1');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe((exampleVariable.document as any).example.var1.$value);
  });

  test('should render valid Scss var', () => {
    const renderer = getSassTokenValueRenderer();
    const variable = designTokens.get('example.var-ref-expect-override');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe('$example-var1');
  });

  test('should render valid Scss var and not print value', () => {
    const renderer = getSassTokenValueRenderer();
    const variable = designTokens.get('example.color2');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toBe('$example-var3');
  });

  test('should render invalid reference and raise warning', () => {
    const warn = jest.fn();
    const renderer = getSassTokenValueRenderer({ logger: { warn } } as any);
    const variable = designTokens.get('example.wrong-ref');

    const result = renderer(variable, designTokens);
    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does.not.exist'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('$does-not-exist'));
    expect(result).toBe('if(variable-exists(does-not-exist), $does-not-exist, null)');
  });

  describe('with extension value override', () => {
    test('should not override non-numeric value', () => {
      const renderer = getSassTokenValueRenderer();
      const variable = designTokens.get('example.var-color-unit-ratio-override');

      const result = renderer(variable, designTokens);
      expect(result).toBe('#000');
    });

    test('should override numeric value and add unit', () => {
      const renderer = getSassTokenValueRenderer();
      const variable = designTokens.get('example.var-number-unit-ratio-override');

      const result = renderer(variable, designTokens);
      expect(result).toBe('5px'); // default value: 2
    });

    test('should override numeric value and unit', () => {
      const renderer = getSassTokenValueRenderer();
      const variable = designTokens.get('example.var-unit-override');

      const result = renderer(variable, designTokens);
      expect(result).toBe('5rem'); // default value: 2px
    });
  });
});
