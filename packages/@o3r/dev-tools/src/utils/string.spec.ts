import {
  pad,
} from './string';

describe('String utils', () => {
  it('pad should add a 0 to number <10 and >=0', () => {
    for (let i = 0; i < 10; i++) {
      expect(pad(i)).toBe(`0${i}`);
    }
  });

  it('pad should not add a 0 to number >=10', () => {
    for (let i = 10; i < 20; i++) {
      expect(pad(i)).toBe(`${i}`);
    }

    expect(pad(100)).toBe('100');
  });

  it('pad should add two 0 to number <10 with digit=3', () => {
    expect(pad(7, 3)).toBe('007');
    expect(pad(77, 3)).toBe('077');
    expect(pad(777, 3)).toBe('777');
  });
});
