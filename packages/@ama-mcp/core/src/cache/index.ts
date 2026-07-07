import {
  existsSync,
} from 'node:fs';
import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  tmpdir,
} from 'node:os';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  type LoggerToolOptions,
  MCPLogger,
} from '../logger';

type CacheEntry<T> = {
  updatedAt: string;
  data: T;
};

type Cache<T> = Record<string, CacheEntry<T>>;

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

/**
 * Default maximum age for cache entries before they are considered expired.
 * @experimental
 */
export const DEFAULT_AMA_MCP_CACHE_MAX_AGE_DAYS = 90;

/**
 * Options for a tool using the cache manager.
 * @experimental
 */
export interface CacheToolOptions extends LoggerToolOptions {
  /**
   * Path to the cache file.
   */
  cacheFilePath?: string;
  /**
   * Maximum age for cache entries before they are considered expired.
   */
  cacheEntryExpireAfterDays?: number;
  /**
   * Whether to prettify the cache file when writing to disk.
   */
  prettifyCacheFile?: boolean;
  /**
   * Whether to disable the cache.
   */
  disableCache?: boolean;
}

interface GetOptions {
  /**
   * Whether to exclude expired entries.
   */
  excludeExpiredEntries?: boolean;
}

/**
 * A simple cache manager that stores cache entries in a JSON file.
 * @experimental
 */
export class CacheManager<T> {
  private cache: Cache<T> = {};
  private readonly options: Required<Omit<CacheToolOptions, 'logLevel'>> & Pick<LoggerToolOptions, 'logLevel'>;

  /**
   * Creates a new CacheManager.
   * @param options CacheManager options.
   */
  constructor(
    options: CacheToolOptions
  ) {
    this.options = {
      cacheFilePath: resolve(tmpdir(), 'ama-mcp-cache.json'),
      cacheEntryExpireAfterDays: DEFAULT_AMA_MCP_CACHE_MAX_AGE_DAYS,
      prettifyCacheFile: false,
      disableCache: false,
      logger: new MCPLogger('CacheManager', options.logLevel),
      ...options
    };
  }

  private async writeCache() {
    if (this.options.disableCache) {
      this.options.logger.debug?.('Cache is disabled; skipping write.');
      return;
    }
    const directory = dirname(this.options.cacheFilePath);
    if (!existsSync(directory)) {
      this.options.logger.debug?.(`Creating cache directory at ${directory}`);
      await mkdir(directory, { recursive: true });
    }
    this.options.logger.debug?.(`Writing cache to ${this.options.cacheFilePath}`, this.cache);
    return writeFile(this.options.cacheFilePath, JSON.stringify(this.cache, null, this.options.prettifyCacheFile ? 2 : 0));
  }

  /**
   * Retrieves a cache entry by key.
   * @param key
   * @param options
   */
  public get(key: string, options: GetOptions = {}): T | undefined {
    const { excludeExpiredEntries = true } = options;
    if (excludeExpiredEntries && this.isExpired(key)) {
      return;
    }
    return this.cache[key]?.data;
  }

  /**
   * Sets a cache entry.
   * @param key
   * @param value
   */
  public set(key: string, value: T) {
    this.cache[key] = {
      updatedAt: new Date().toISOString(),
      data: value
    };
    return this.writeCache();
  }

  /**
   * Clears the entire cache.
   */
  public clear() {
    this.cache = {};
    return this.writeCache();
  }

  /**
   * Loads the cache from the cache file.
   * @param options
   * @param options.throwOnError Whether to throw an error if the cache file cannot be read.
   */
  public async initialize(options: GetOptions & { throwOnError?: boolean } = {}) {
    const { excludeExpiredEntries = true, throwOnError = false } = options;
    if (this.options.disableCache) {
      this.options.logger.debug?.('Cache is disabled; skipping initialization.');
      return;
    }
    try {
      this.cache = JSON.parse(await readFile(this.options.cacheFilePath, { encoding: 'utf8' })) as Cache<T>;
      if (excludeExpiredEntries) {
        let cacheUpdated = false;
        Object.keys(this.cache).forEach((key) => {
          if (this.isExpired(key)) {
            delete this.cache[key];
            cacheUpdated = true;
          }
        });
        if (cacheUpdated) {
          await this.writeCache();
        }
      }
    } catch (e) {
      this.options.logger.warn?.(`Could not read cache file at ${this.options.cacheFilePath}, starting with empty cache.`);
      if (throwOnError) {
        throw e;
      }
    }
  }

  /**
   * Iterates over all cache entries.
   * @param callback
   * @param options
   */
  public forEach(callback: (key: string, entry: T | undefined) => void, options: GetOptions = {}) {
    Object.keys(this.cache).forEach((key) =>
      callback(key, this.get(key, options))
    );
  }

  /**
   * Checks if a cache entry is expired.
   * @param key
   */
  public isExpired(key: string): boolean {
    const entry = this.cache[key];
    if (!entry) {
      return true;
    }
    if (this.options.cacheEntryExpireAfterDays) {
      const ageMs = Date.now() - new Date(entry.updatedAt).getTime();
      return ageMs > (this.options.cacheEntryExpireAfterDays * MS_IN_A_DAY);
    }
    return false;
  }

  /**
   * Returns the available keys
   * @param options
   */
  public getKeys(options: GetOptions = {}): string[] {
    const { excludeExpiredEntries = true } = options;
    if (!excludeExpiredEntries) {
      return Object.keys(this.cache);
    }
    return Object.keys(this.cache).filter((key) => !this.isExpired(key));
  }

  /**
   * Returns the available entries
   * @param options
   */
  public getEntries(options: GetOptions = {}): [string, T][] {
    const { excludeExpiredEntries = true } = options;
    if (!excludeExpiredEntries) {
      return Object.entries(this.cache).map(([key, entry]) => [key, entry.data]);
    }
    return Object.entries(this.cache)
      .filter(([key]) => !this.isExpired(key))
      .map(([key, entry]) => [key, entry.data]);
  }
}
