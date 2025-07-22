import {
  generateThemeCss,
} from './helpers';

describe('generateThemeCss', () => {
  it('should generate a css file', () => {
    const result = generateThemeCss({ '--test-var': '#000' });

    expect(result).toMatch('--test-var: #000;');
  });

  it('should generate a css file from diff', () => {
    const result = generateThemeCss({ '--test-var': '#000', '--test-var2': '#fff' }, { '--test-var': '#fff', '--test-var2': '#fff' });

    expect(result).toMatch('--test-var: #000;');
    expect(result).not.toMatch('--test-var2');
  });
});
