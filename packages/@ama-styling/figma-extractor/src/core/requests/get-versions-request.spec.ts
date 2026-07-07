import {
  type GetProjectFiles200ResponseFilesInner,
  type Version,
} from '@ama-styling/figma-sdk';

jest.mock('@ama-styling/figma-sdk', () => ({
  FilesApi: jest.fn(),
  ProjectsApi: jest.fn()
}));

describe('getFileVersions', () => {
  test('should correctly retrieve the versions', async () => {
    const getFileVersionsMock = jest.fn().mockResolvedValue({
      versions: [
        {
          label: 'invalidNumber'
        },
        {
          label: '3.2.1'
        },
        {
          label: '4.0.0'
        },
        {
          label: '2.1.0'
        },
        {
          label: '1.2.3'
        }
      ] satisfies Partial<Version>[]
    });

    require('@ama-styling/figma-sdk').FilesApi.mockReturnValue({ getFileVersions: getFileVersionsMock });
    const testApi: any = {};

    const { getFileVersions } = require('./get-versions-request');
    const versions = await getFileVersions(testApi, { fileKey: 'testFile', versionRange: '<2.0.0-0 || >2.2.0-0' });

    expect(versions).toHaveLength(3);
    expect(versions.at(0)).toEqual({
      fileKey: 'testFile',
      label: '4.0.0'
    });
  });
});

describe('getAvailableMajorVersions', () => {
  test('should correctly retrieve project major versions', async () => {
    const getProjectFilesMock = jest.fn().mockResolvedValue({
      files: [
        {
          name: 'invalid file name'
        },
        {
          name: 'ignore file v20'
        },
        {
          name: 'test vInvalid'
        },
        {
          name: 'test v1.2.3'
        },
        {
          name: 'test v2.1'
        },
        {
          name: 'test v3'
        },
        {
          name: 'test v1.5'
        }
      ] satisfies Partial<GetProjectFiles200ResponseFilesInner>[]
    });
    require('@ama-styling/figma-sdk').ProjectsApi.mockReturnValue({ getProjectFiles: getProjectFilesMock });
    const testApi: any = {};

    const { getAvailableMajorVersions } = require('./get-versions-request');
    const versions = await getAvailableMajorVersions(
      testApi,
      {
        fileNameMatcher: 'test (v.+)$',
        versionRange: '<2.0.0-0 || >2.2.0-0'
      }
    );

    expect(versions).toHaveLength(3);
    expect(versions.at(0)).toEqual({
      file: {
        name: 'test v3'
      },
      version: '3.0.0',
      range: '3.*.*'
    });
  });
});

describe('getAllVersions', () => {
  test('should correctly retrieve all versions', async () => {
    const getProjectFilesMock = jest.fn().mockResolvedValue({
      files: [
        {
          name: 'invalid file name'
        },
        {
          name: 'ignore file v20'
        },
        {
          name: 'test vInvalid'
        },
        {
          name: 'test v1.2.4',
          key: 'no matching version in file'
        },
        {
          name: 'test v2.1',
          key: 'exclude by range'
        },
        {
          name: 'test v3',
          key: 'for v3.*.*'
        },
        {
          name: 'test v1.5',
          key: 'for v1.5.*'
        }
      ] satisfies Partial<GetProjectFiles200ResponseFilesInner>[]
    });
    const getFileVersionsMock = jest.fn().mockResolvedValue({
      versions: [
        {
          label: 'invalidNumber'
        },
        {
          label: '3.2.1'
        },
        {
          label: '4.0.0'
        },
        {
          label: '2.1.0'
        },
        {
          label: '1.2.3'
        },
        {
          label: '1.5.1'
        }
      ] satisfies Partial<Version>[]
    });

    const { ProjectsApi, FilesApi } = require('@ama-styling/figma-sdk');
    ProjectsApi.mockReturnValue({ getProjectFiles: getProjectFilesMock });
    FilesApi.mockReturnValue({ getFileVersions: getFileVersionsMock });

    const testApi: any = {};

    const { getAllVersions } = require('./get-versions-request');
    const versions = await getAllVersions(
      testApi,
      {
        fileNameMatcher: 'test (v.+)$',
        versionRange: '<2.0.0-0 || >2.2.0-0'
      }
    );

    expect(versions).toHaveLength(2);
    expect(versions).toContainEqual({ fileKey: 'for v3.*.*', label: '3.2.1' });
    expect(versions).toContainEqual({ fileKey: 'for v1.5.*', label: '1.5.1' });
  });
});
