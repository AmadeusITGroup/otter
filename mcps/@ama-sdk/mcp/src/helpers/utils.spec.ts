import {
  isValidPackageName,
} from './utils';

describe('utils.helpers', () => {
  describe('isValidPackageName', () => {
    describe('valid package names', () => {
      it('should accept simple package names', () => {
        expect(isValidPackageName('lodash')).toBe(true);
        expect(isValidPackageName('my-package')).toBe(true);
        expect(isValidPackageName('package123')).toBe(true);
      });

      it('should accept scoped package names', () => {
        expect(isValidPackageName('@scope/package')).toBe(true);
        expect(isValidPackageName('@my-org/my-package')).toBe(true);
        expect(isValidPackageName('@ama-sdk/core')).toBe(true);
      });

      it('should accept package names with dots and underscores', () => {
        expect(isValidPackageName('package.name')).toBe(true);
        expect(isValidPackageName('package_name')).toBe(true);
        expect(isValidPackageName('@scope/package.name')).toBe(true);
      });
    });

    describe('invalid package names', () => {
      it('should reject empty or falsy values', () => {
        expect(isValidPackageName('')).toBe(false);
        expect(isValidPackageName(null as any)).toBe(false);
        expect(isValidPackageName(undefined as any)).toBe(false);
      });

      it('should reject path traversal attempts', () => {
        expect(isValidPackageName('../../../etc/passwd')).toBe(false);
        expect(isValidPackageName('..\\..\\windows\\system32')).toBe(false);
        expect(isValidPackageName('@scope/../malicious')).toBe(false);
      });

      it('should reject absolute paths', () => {
        expect(isValidPackageName('/etc/passwd')).toBe(false);
        expect(isValidPackageName('C:\\Windows\\System32')).toBe(false);
      });

      it('should reject backslash paths', () => {
        expect(isValidPackageName('package\\subpath')).toBe(false);
      });

      it('should reject invalid npm package name patterns', () => {
        expect(isValidPackageName('-package')).toBe(false);
        expect(isValidPackageName('@/package')).toBe(false);
      });
    });
  });
});
