import {
  convertNameToReference,
} from './name-to-reference';

describe('convertNameToReference', () => {
  test('should return a proper value', () => {
    expect(convertNameToReference('my var/value')).toBe('my-var.value');
  });
});
