import {
  promises as fs,
} from 'node:fs';
import {
  isJsonFile,
  parseFile,
} from './parse-file.mjs';

// Mock fs module
jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn(),
    access: jest.fn()
  }
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('parseFile', () => {
  const mockFilePath = '/path/to/test-file.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('successful parsing', () => {
    it('should parse a valid JSON file', async () => {
      const mockJsonContent = '{"name": "test", "version": "1.0.0"}';
      const expectedParsedContent = { name: 'test', version: '1.0.0' };

      mockedFs.readFile.mockResolvedValue(mockJsonContent);

      const result = await parseFile(mockFilePath);

      expect(mockedFs.readFile).toHaveBeenCalledWith(mockFilePath, { encoding: 'utf8' });
      expect(result).toEqual(expectedParsedContent);
    });

    it('should parse a valid YAML file', async () => {
      const mockYamlContent = 'name: test\nversion: 1.0.0';
      const yamlFilePath = '/path/to/test-file.yaml';

      mockedFs.readFile.mockResolvedValue(mockYamlContent);

      const result = await parseFile(yamlFilePath);

      expect(mockedFs.readFile).toHaveBeenCalledWith(yamlFilePath, { encoding: 'utf8' });
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw an error when file does not exist', async () => {
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';

      mockedFs.readFile.mockRejectedValue(error);

      await expect(parseFile(mockFilePath)).rejects.toThrow('ENOENT: no such file or directory');
    });

    it('should throw an error for invalid JSON content', async () => {
      const invalidJson = '{"name": "test", "version":}';

      mockedFs.readFile.mockResolvedValue(invalidJson);

      await expect(parseFile(mockFilePath)).rejects.toThrow();
    });

    it('should handle permission errors', async () => {
      const error = new Error('EACCES: permission denied');
      (error as any).code = 'EACCES';

      mockedFs.readFile.mockRejectedValue(error);

      await expect(parseFile(mockFilePath)).rejects.toThrow('EACCES: permission denied');
    });
  });

  describe('file type detection', () => {
    it('should detect JSON files by extension', async () => {
      const jsonFilePath = '/path/to/config.json';
      const mockContent = '{"key": "value"}';

      mockedFs.readFile.mockResolvedValue(mockContent);

      const result = await parseFile(jsonFilePath);

      expect(result).toEqual({ key: 'value' });
    });

    it('should detect YAML files by .yml extension', async () => {
      const yamlFilePath = '/path/to/config.yml';
      const mockContent = 'key: value';

      mockedFs.readFile.mockResolvedValue(mockContent);

      const result = await parseFile(yamlFilePath);

      expect(result).toBeDefined();
    });

    it('should detect YAML files by .yaml extension', async () => {
      const yamlFilePath = '/path/to/config.yaml';
      const mockContent = 'key: value';

      mockedFs.readFile.mockResolvedValue(mockContent);

      const result = await parseFile(yamlFilePath);

      expect(result).toBeDefined();
    });
  });

  describe('complex content parsing', () => {
    it('should parse nested JSON objects', async () => {
      const complexJson = JSON.stringify({
        metadata: {
          name: 'test-api',
          version: '1.0.0'
        },
        paths: {
          '/users': {
            get: {
              summary: 'Get users'
            }
          }
        }
      });

      mockedFs.readFile.mockResolvedValue(complexJson);

      const result = await parseFile(mockFilePath);

      expect(result).toHaveProperty('metadata.name', 'test-api');
      expect(result).toHaveProperty('paths./users.get.summary', 'Get users');
    });

    it('should parse arrays in JSON', async () => {
      const jsonWithArray = JSON.stringify({
        items: ['item1', 'item2', 'item3'],
        nested: {
          array: [1, 2, 3]
        }
      });

      mockedFs.readFile.mockResolvedValue(jsonWithArray);

      const result: any = await parseFile(mockFilePath);

      expect(result.items).toHaveLength(3);
      expect(result.nested.array).toEqual([1, 2, 3]);
    });
  });

  describe('performance and edge cases', () => {
    it('should handle large files efficiently', async () => {
      const largeObject = {
        data: Array.from({ length: 1000 }).fill(0).map((_, i) => ({ id: i, value: `value-${i}` }))
      };
      const largeJson = JSON.stringify(largeObject);

      mockedFs.readFile.mockResolvedValue(largeJson);

      const startTime = Date.now();
      const result: any = await parseFile(mockFilePath);
      const endTime = Date.now();

      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle files with special characters', async () => {
      const specialCharJson = JSON.stringify({
        unicode: '🚀 test with émojis and accénts',
        special: 'line1\nline2\ttab',
        quotes: 'string with "quotes" and \'apostrophes\''
      });

      mockedFs.readFile.mockResolvedValue(specialCharJson);

      const result: any = await parseFile(mockFilePath);

      expect(result.unicode).toBe('🚀 test with émojis and accénts');
      expect(result.special).toBe('line1\nline2\ttab');
      expect(result.quotes).toBe('string with "quotes" and \'apostrophes\'');
    });
  });
});

describe('isJsonFile', () => {
  it('should return true for .json extension', () => {
    expect(isJsonFile('config.json')).toBe(true);
    expect(isJsonFile('CONFIG.JSON')).toBe(true);
  });

  it('should return false for non-.json extensions', () => {
    expect(isJsonFile('config.yaml')).toBe(false);
    expect(isJsonFile('config.yml')).toBe(false);
    expect(isJsonFile('config.txt')).toBe(false);
    expect(isJsonFile('config.JSON.txt')).toBe(false);
  });
});
