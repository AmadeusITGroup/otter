import * as parser from '../../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../../parsers';
import { getCssStyleContentUpdater } from './design-token-updater.renderers';

describe('getCssStyleContentUpdater', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  const startTag = '/* test start */';
  const endTag = '/* end start */';
  const cssUpdaterOptions = { startTag, endTag};

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = JSON.parse(file);
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should render CSS Values', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);
    const variable = designTokens.get('example.var1');

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/');

    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).toContain(variables[0]);
    expect(result).toContain(variables[1]);
  });

  test('should add tags to new file', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);
    const variable = designTokens.get('example.var1');

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/');

    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result.replace(/[\r\n]*/g, '').indexOf(':root {' + startTag)).toEqual(0);
    expect(result.replace(/[\r\n]*/g, '').indexOf(endTag) + (endTag + '}').length).toBe(result.replace(/[\r\n]*/g, '').length);
  });

  test('should only update within tag part', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);
    const variable = designTokens.get('example.var1');
    const content = `.my-component {
      ${startTag}
      --my-comp: red;
      ${endTag}
    }
    `;

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/', content);

    expect(variable).toBeDefined();
    expect(result).toBeDefined();
    expect(result).not.toContain(':root');
    expect(result).toContain('.my-component {');
    expect(result).not.toContain('--my-comp: red;');
    expect(result).toContain('--var1: #000');
  });
});
