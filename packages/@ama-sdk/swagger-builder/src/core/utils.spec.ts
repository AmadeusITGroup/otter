import {
  calculatePrefix,
} from './utils';

describe('calculatePrefix function', () => {
  test('should provide correct prefix when path available', () => {
    const prefix = calculatePrefix('testName', 'path/to/the/spec-file.yaml');
    expect(prefix).toBe('_SpecFile');
  });

  test('should provide correct prefix when no path available', () => {
    const prefix = calculatePrefix('testName');
    expect(prefix).toBe('_Base');
  });

  test('should provide correct when conflict', () => {
    const prefix = calculatePrefix('SpecFileTestName', 'path/to/the/spec-file.yaml');
    expect(prefix).toBe('_Base');
  });
});
