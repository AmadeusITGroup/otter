import {CapitalizePipe} from './capitalize.pipe';

describe('CapitalizePipe', () => {
  const pipe = new CapitalizePipe();

  it('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });

  it('transforms "abc def" to "Abc def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc def');
  });

  it('ignores whitespace', () => {
    expect(pipe.transform(' ')).toBe(' ');
  });

  it('does not break on empty values', () => {
    expect(pipe.transform()).toBe(undefined);
    expect(pipe.transform(null)).toBe(null);
  });
});
