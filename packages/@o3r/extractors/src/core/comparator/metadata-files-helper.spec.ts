const {
  mockBaseName,
  mockGt,
  mockCoerce,
  mockNpmGetFilesFromRegistry,
  mockYarnGetFilesFromRegistry,
} = vi.hoisted(() => ({
  mockBaseName: vi.fn(),
  mockGt: vi.fn(),
  mockCoerce: vi.fn(),
  mockNpmGetFilesFromRegistry: vi.fn(),
  mockYarnGetFilesFromRegistry: vi.fn()
}));
vi.mock('node:path', async () => {
  const original = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    ...original,
    basename: mockBaseName
  };
});
vi.mock('semver', async () => {
  const original = await vi.importActual<typeof import('semver')>('semver');
  return {
    ...original,
    coerce: mockCoerce,
    gt: mockGt
  };
});
vi.mock('./package-managers-extractors/npm-file-extractor-helper', async () => ({
  default: { getFilesFromRegistry: mockNpmGetFilesFromRegistry },
  getFilesFromRegistry: mockNpmGetFilesFromRegistry
}));
vi.mock('./package-managers-extractors/yarn2-file-extractor-helper', async () => ({
  default: { getFilesFromRegistry: mockYarnGetFilesFromRegistry },
  getFilesFromRegistry: mockYarnGetFilesFromRegistry
}));

// eslint-disable-next-line import/first -- needed for `vi.mock`
import {
  getFilesFromRegistry,
  getLatestMigrationMetadataFile,
  getVersionRangeFromLatestVersion,
} from './metadata-files-helper';

const getFakePath = (fileName: string) => `path/${fileName}`;

describe('metadata files helpers', () => {
  beforeEach(() => {
    mockBaseName.mockReset();
    mockGt.mockReset();
    mockCoerce.mockReset();
    mockNpmGetFilesFromRegistry.mockReset();
    mockYarnGetFilesFromRegistry.mockReset();
  });

  describe('getLatestMigrationMetadataFile', () => {
    it('should return undefined', async () => {
      const fileName = 'migration.json';
      mockBaseName.mockReturnValueOnce(fileName);
      await expect(getLatestMigrationMetadataFile([getFakePath(fileName)])).resolves.toBeUndefined();
    });

    it('should return 1.23', async () => {
      const firstFileName = 'migration-1.1.json';
      const secondFileName = 'migration-1.23.json';
      const thirdFileName = 'migration-1.0.json';

      mockBaseName
        .mockReturnValueOnce(firstFileName)
        .mockReturnValueOnce(secondFileName)
        .mockReturnValueOnce(thirdFileName);
      mockGt
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(getLatestMigrationMetadataFile([
        getFakePath(firstFileName),
        getFakePath(secondFileName),
        getFakePath(thirdFileName)
      ])).resolves.toEqual({
        version: '1.23',
        path: getFakePath(secondFileName)
      });
    });
  });

  describe('getVersionRangeFromLatestVersion', () => {
    it('should throw an error', async () => {
      const invalidVersion = 'invalid-version';
      const expectedErrorMessage = new RegExp(`${invalidVersion} is not a valid version.`);
      await expect(getVersionRangeFromLatestVersion(invalidVersion, 'major')).rejects.toThrow(expectedErrorMessage);
      await expect(getVersionRangeFromLatestVersion(invalidVersion, 'minor')).rejects.toThrow(expectedErrorMessage);
    });

    it('should return the good granularity version', async () => {
      const major = 1;
      const minor = 3;
      mockCoerce.mockReturnValue({ major, minor });
      await expect(getVersionRangeFromLatestVersion(`${major}.${minor}.14`, 'major')).resolves.toBe(`<${major}.0.0-a`);
      await expect(getVersionRangeFromLatestVersion(`${major}.${minor}.14`, 'minor')).resolves.toBe(`<${major}.${minor}.0-a`);
    });
  });

  describe('getFilesFromRegistry', () => {
    it('should call getFilesFromRegistry from npm helpers', async () => {
      await getFilesFromRegistry('', [], 'npm');
      expect(mockNpmGetFilesFromRegistry).toHaveBeenCalled();
      expect(mockYarnGetFilesFromRegistry).not.toHaveBeenCalled();
    });

    it('should call getFilesFromRegistry from yarn helpers', async () => {
      await getFilesFromRegistry('', [], 'yarn');
      expect(mockNpmGetFilesFromRegistry).not.toHaveBeenCalled();
      expect(mockYarnGetFilesFromRegistry).toHaveBeenCalled();
    });
  });
});
