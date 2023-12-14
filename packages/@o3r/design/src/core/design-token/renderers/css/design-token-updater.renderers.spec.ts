import { getCssStyleContentUpdater } from './design-token-updater.renderers';

describe('getCssStyleContentUpdater', () => {
  const startTag = '/* test start */';
  const endTag = '/* end start */';
  const cssUpdaterOptions = { startTag, endTag};

  test('should render CSS Values', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/');

    expect(result).toBeDefined();
    expect(result).toContain(variables[0]);
    expect(result).toContain(variables[1]);
  });

  test('should add tags to new file', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/');

    expect(result).toBeDefined();
    expect(result.replace(/[\r\n]*/g, '').indexOf(':root {' + startTag)).toEqual(0);
    expect(result.replace(/[\r\n]*/g, '').indexOf(endTag) + (endTag + '}').length).toBe(result.replace(/[\r\n]*/g, '').length);
  });

  test('should only update within tag part', () => {
    const renderer = getCssStyleContentUpdater(cssUpdaterOptions);
    const content = `.my-component {
      ${startTag}
      --my-comp: red;
      ${endTag}
    }
    `;

    const variables = ['--var1: #000', '--var2: #fff'];
    const result = renderer(variables, '/', content);

    expect(result).toBeDefined();
    expect(result).not.toContain(':root');
    expect(result).toContain('.my-component {');
    expect(result).not.toContain('--my-comp: red;');
    expect(result).toContain('--var1: #000');
  });
});
