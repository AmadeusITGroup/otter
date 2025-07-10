import {
  getColorHex,
  getRgbaColorHex,
} from './color-hex.helpers';

describe('getColorHex', () => {
  it('should return hex code for numeric color', () => {
    expect(getColorHex(0)).toBe('00');
    expect(getColorHex(1)).toBe('ff');
  });
  it('should throw for invalid value', () => {
    expect(() => getColorHex(-0.1)).toThrow();
    expect(() => getColorHex(1.1)).toThrow();
  });
});

describe('getRgbaColorHex', () => {
  it('should return hex code for numeric color', () => {
    expect(getRgbaColorHex({ r: 0, g: 0, b: 0, a: 0 })).toBe('#00000000');
    expect(getRgbaColorHex({ r: 1, g: 1, b: 1, a: 0.5 })).toBe('#ffffff80');
  });
  it('should not display alpha with maximum opacity', () => {
    expect(getRgbaColorHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
  });
  it('should throw for invalid value', () => {
    expect(() => getRgbaColorHex({ r: 2, g: 0, b: 0, a: 1 })).toThrow();
  });
});
