const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();

jest.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync
}));

/* eslint-disable import/first -- needed to mock modules before importing the tested module */
import {
  loadSdkContexts,
} from './context';
/* eslint-enable import/first */

describe('context', () => {
  const contextFileName = 'SDK_CONTEXT.md';

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReset();
    mockReadFileSync.mockReset();
  });

  describe('loadSdkContexts', () => {
    it('should return empty array when no packages provided', () => {
      const result = loadSdkContexts([], contextFileName);

      expect(result).toEqual([]);
    });

    it('should skip invalid package names and return empty array', () => {
      const result = loadSdkContexts(['../malicious', '../../etc/passwd'], contextFileName);

      expect(result).toEqual([]);
    });

    it('should return empty array for packages that are not installed', () => {
      const result = loadSdkContexts(['@nonexistent/package-that-does-not-exist'], contextFileName);

      expect(result).toEqual([]);
    });

    it('should return SDK context info when package and context file exist', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('# SDK Context Content');

      // Use tslib which is a direct dependency and definitely resolvable
      const result = loadSdkContexts(['tslib'], contextFileName);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        packageName: 'tslib',
        content: '# SDK Context Content',
        uri: 'sdk-context://tslib'
      });
      expect(mockReadFileSync).toHaveBeenCalledWith(expect.stringContaining(contextFileName), 'utf8');
    });

    it('should return multiple SDK contexts for multiple valid packages', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce('# Context for package 1')
        .mockReturnValueOnce('# Context for package 2');

      // Use tslib twice - what matters is testing multiple package handling
      const result = loadSdkContexts(['tslib', 'tslib'], contextFileName);

      expect(result).toHaveLength(2);
      expect(result[0].packageName).toBe('tslib');
      expect(result[0].content).toBe('# Context for package 1');
      expect(result[1].packageName).toBe('tslib');
      expect(result[1].content).toBe('# Context for package 2');
    });

    it('should return empty array when context file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = loadSdkContexts(['tslib'], contextFileName);

      expect(result).toEqual([]);
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    it('should return empty array when reading file throws an error', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = loadSdkContexts(['tslib'], contextFileName);

      expect(result).toEqual([]);
    });

    it('should filter out invalid packages and return only valid ones', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('# Valid context');

      const result = loadSdkContexts(['../invalid', 'tslib', '../../malicious'], contextFileName);

      expect(result).toHaveLength(1);
      expect(result[0].packageName).toBe('tslib');
      // Verify invalid packages were rejected before fs operations
      expect(mockExistsSync).toHaveBeenCalledTimes(1);
      expect(mockReadFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
