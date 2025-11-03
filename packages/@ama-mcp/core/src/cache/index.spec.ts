const NOW = new Date();
const TWO_DAYS_AGO = new Date(NOW.getTime() - (2 * 24 * 60 * 60 * 1000));
const writeFileMock = jest.fn();

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn().mockImplementation((path: string) => {
    if (path.endsWith('non-existent-path/test-cache.json')) {
      return Promise.reject(new Error('File not found'));
    }
    return Promise.resolve(JSON.stringify({
      expiredCachedKey: { updatedAt: TWO_DAYS_AGO, data: { value: 'expiredCachedValue' } },
      recentCachedKey: { updatedAt: NOW, data: { value: 'recentCachedValue' } }
    }));
  }),
  writeFile: writeFileMock
}));

/* eslint-disable import/first -- needed to mock modules before importing the tested module */
import {
  CacheManager,
  type CacheToolOptions,
} from './index';

type TestValue = { value: string };

/**
 * Helper to create a cache manager with default options and overrides.
 * @param overrides
 */
const createManager = (overrides: Partial<CacheToolOptions> = {}) =>
  new CacheManager<TestValue>({
    cacheEntryExpireAfterDays: 1,
    cacheFilePath: 'test-cache.json',
    ...overrides
  });

/**
 * Set entries directly into the internal cache map for setup scenarios.
 * @param cacheManager
 * @param entries
 */
const setEntries = async (
  cacheManager: CacheManager<TestValue>,
  entries: { key: string; value: string; updatedAt?: Date }[]
) => {
  await cacheManager.clear();
  entries.forEach(({ key, value, updatedAt }) => {
    (cacheManager as any).cache[key] = {
      data: { value },
      updatedAt: (updatedAt || NOW).toISOString()
    };
  });
};

/**
 * Assert that writeFile was called with a file content containing all substrings.
 * @param substrings
 */
const expectWriteFileContaining = (...substrings: string[]) => {
  substrings.forEach((substr) => {
    expect(writeFileMock).toHaveBeenCalledWith('test-cache.json', expect.stringContaining(substr));
  });
};

describe('CacheManager', () => {
  let cacheManager: CacheManager<TestValue>;

  beforeEach(async () => {
    cacheManager = createManager();
    await setEntries(cacheManager, [{ key: 'testKey', value: 'testValue', updatedAt: TWO_DAYS_AGO }]);
    writeFileMock.mockClear();
  });

  describe('expiration logic', () => {
    it('marks entries expired when past the configured number of days', () => {
      expect(cacheManager.isExpired('testKey')).toBe(true);
    });

    it('considers entries not expired when within the expiration window', async () => {
      cacheManager = createManager({ cacheEntryExpireAfterDays: 3 });
      await setEntries(cacheManager, [{ key: 'testKey', value: 'testValue', updatedAt: TWO_DAYS_AGO }]);
      expect(cacheManager.isExpired('testKey')).toBe(false);
    });
  });

  describe('get()', () => {
    it('returns undefined for expired entry when returnUndefinedIfExpired=true', () => {
      expect(cacheManager.get('testKey', { excludeExpiredEntries: true })).toBeUndefined();
    });

    it('returns value for expired entry when returnUndefinedIfExpired=false', () => {
      expect(cacheManager.get('testKey', { excludeExpiredEntries: false })).toEqual({ value: 'testValue' });
    });

    it('returns value for non-expired entry', async () => {
      await setEntries(cacheManager, [{ key: 'testKey', value: 'testValue', updatedAt: NOW }]);
      expect(cacheManager.get('testKey')).toEqual({ value: 'testValue' });
    });

    it('returns undefined for non-existent key', () => {
      expect(cacheManager.get('nonExistentKey')).toBeUndefined();
    });
  });

  describe('helpers (getKeys, getEntries, forEach)', () => {
    beforeEach(async () => {
      await setEntries(cacheManager, [
        { key: 'validKey', value: 'validValue', updatedAt: NOW },
        { key: 'expiredKey', value: 'expiredValue', updatedAt: TWO_DAYS_AGO }
      ]);
    });

    describe('getKeys()', () => {
      it('getKeys(excludeExpired=true) returns only non-expired keys', () => {
        expect(cacheManager.getKeys({ excludeExpiredEntries: true })).toEqual(['validKey']);
      });

      it('getKeys(excludeExpired=false) returns all keys including expired', () => {
        expect(cacheManager.getKeys({ excludeExpiredEntries: false })).toEqual(['validKey', 'expiredKey']);
      });
    });

    describe('getEntries()', () => {
      it('getEntries(excludeExpired=true) returns only non-expired entries', () => {
        expect(cacheManager.getEntries({ excludeExpiredEntries: true })).toEqual([['validKey', { value: 'validValue' }]]);
      });

      it('getEntries(excludeExpired=false) returns both expired and non-expired entries', () => {
        expect(cacheManager.getEntries({ excludeExpiredEntries: false })).toEqual([
          ['validKey', { value: 'validValue' }],
          ['expiredKey', { value: 'expiredValue' }]
        ]);
      });
    });

    describe('forEach()', () => {
      it('forEach() yields undefined for expired entries by default', () => {
        const results: { key: string; entry: TestValue | undefined }[] = [];
        cacheManager.forEach((key, entry) => results.push({ key, entry }));
        expect(results).toEqual([
          { key: 'validKey', entry: { value: 'validValue' } },
          { key: 'expiredKey', entry: undefined }
        ]);
      });

      it('forEach(includeExpired=false) includes expired entries data', () => {
        const results: { key: string; entry: TestValue | undefined }[] = [];
        // eslint-disable-next-line unicorn/no-array-method-this-argument -- false positive `CacheManage.forEach` is not an array method
        cacheManager.forEach((key, entry) => results.push({ key, entry }), { excludeExpiredEntries: false });
        expect(results).toEqual([
          { key: 'validKey', entry: { value: 'validValue' } },
          { key: 'expiredKey', entry: { value: 'expiredValue' } }
        ]);
      });
    });
  });

  describe('mutation operations (set, get, clear)', () => {
    it('set() persists a new entry and get() retrieves it', async () => {
      const previousValue = cacheManager.get('testKey');
      await cacheManager.set('testKey', { value: 'newValue' });
      expect(cacheManager.get('testKey')).not.toEqual(previousValue);
      expect(cacheManager.get('testKey')).toEqual({ value: 'newValue' });
      expect(writeFileMock).toHaveBeenCalled();
      expectWriteFileContaining('testKey', 'newValue');
    });

    it('clear() removes all entries and writes an empty object', async () => {
      await cacheManager.set('keyToClear', { value: 'valueToClear' });
      await cacheManager.clear();
      expect(cacheManager.getKeys({ excludeExpiredEntries: false })).toHaveLength(0);
      expect(writeFileMock).toHaveBeenCalledWith('test-cache.json', '{}');
    });
  });

  describe('initialization', () => {
    it('initialize(excludeExpired=true) excludes expired entries from cache', async () => {
      await cacheManager.initialize({ excludeExpiredEntries: true });
      expect(cacheManager.get('expiredCachedKey')).toBeUndefined();
      expect(cacheManager.get('recentCachedKey')).toBeDefined();
    });

    it('initialize(excludeExpired=false) keeps expired entries', async () => {
      await cacheManager.initialize({ excludeExpiredEntries: false });
      expect((cacheManager as any).cache.expiredCachedKey.data).toEqual({ value: 'expiredCachedValue' });
    });

    describe('error handling', () => {
      it('does not throw when throwOnError=false', async () => {
        const faulty = createManager({ cacheFilePath: 'non-existent-path/test-cache.json' });
        await expect(faulty.initialize({ throwOnError: false })).resolves.not.toThrow();
      });

      it('throws when throwOnError=true', async () => {
        const faulty = createManager({ cacheFilePath: 'non-existent-path/test-cache.json' });
        await expect(faulty.initialize({ throwOnError: true })).rejects.toThrow();
      });
    });
  });
});
