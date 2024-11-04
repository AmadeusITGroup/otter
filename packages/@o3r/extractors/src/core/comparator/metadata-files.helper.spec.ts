const mockBaseName = jest.fn();
jest.mock('node:path', () => {
  const original = jest.requireActual('node:path');
  return {
    ...original,
    basename: mockBaseName
  };
});
const mockGt = jest.fn();
const mockCoerce = jest.fn();
jest.mock('semver', () => {
  const original = jest.requireActual('semver');
  return {
    ...original,
    coerce: mockCoerce,
    gt: mockGt
  };
});
const mockNpmGetFilesFromRegistry = jest.fn();
jest.mock('./package-managers-extractors/npm-file-extractor.helper', () => ({
  getFilesFromRegistry: mockNpmGetFilesFromRegistry
}));
const mockYarnGetFilesFromRegistry = jest.fn();
jest.mock('./package-managers-extractors/yarn2-file-extractor.helper', () => ({
  getFilesFromRegistry: mockYarnGetFilesFromRegistry
}));

// eslint-disable-next-line import/first -- needed for `jest.mock`
import {
  getFilesFromRegistry,
  getLatestMigrationMetadataFile,
  getVersionRangeFromLatestVersion
} from './metadata-files.helper';

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
      await expect(getVersionRangeFromLatestVersion(`${major}.${minor}.14`, 'major')).resolves.toBe(`<${major}.0.0`);
      await expect(getVersionRangeFromLatestVersion(`${major}.${minor}.14`, 'minor')).resolves.toBe(`<${major}.${minor}.0`);
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
