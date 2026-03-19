import {
  getDebugKey,
} from './localization-helpers';

describe('localization helpers', () => {
  describe('getDebugKey', () => {
    it('should format key and value with a dash separator', () => {
      expect(getDebugKey('my.key', 'My Value')).toBe('my.key - My Value');
    });

    it('should handle empty key', () => {
      expect(getDebugKey('', 'My Value')).toBe(' - My Value');
    });

    it('should handle empty value', () => {
      expect(getDebugKey('my.key', '')).toBe('my.key - ');
    });

    it('should handle both empty key and value', () => {
      expect(getDebugKey('', '')).toBe(' - ');
    });
  });
});
