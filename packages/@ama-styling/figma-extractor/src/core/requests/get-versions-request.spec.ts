import {
  type GetProjectFiles200ResponseFilesInner,
  type Version,
} from '@ama-styling/figma-sdk';

const {
  filesApiMock,
  projectsApiMock,
} = vi.hoisted(() => ({
  filesApiMock: vi.fn(),
  projectsApiMock: vi.fn()
}));

vi.mock('@ama-styling/figma-sdk', () => ({
  FilesApi: filesApiMock,
  ProjectsApi: projectsApiMock
}));

describe('getFileVersions', () => {
  test('should correctly retrieve the versions', async () => {
    const getFileVersionsMock = vi.fn().mockResolvedValue({
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

    filesApiMock.mockImplementation(class {
      constructor() {
        return { getFileVersions: getFileVersionsMock };
      }
    });
    const testApi: any = {};

    const { getFileVersions } = (await import('./get-versions-request'));
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
    const getProjectFilesMock = vi.fn().mockResolvedValue({
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
    projectsApiMock.mockImplementation(class {
      constructor() {
        return { getProjectFiles: getProjectFilesMock };
      }
    });
    const testApi: any = {};

    const { getAvailableMajorVersions } = (await import('./get-versions-request'));
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
    const getProjectFilesMock = vi.fn().mockResolvedValue({
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
    const getFileVersionsMock = vi.fn().mockResolvedValue({
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

    projectsApiMock.mockImplementation(class {
      constructor() {
        return { getProjectFiles: getProjectFilesMock };
      }
    });
    filesApiMock.mockImplementation(class {
      constructor() {
        return { getFileVersions: getFileVersionsMock };
      }
    });

    const testApi: any = {};

    const { getAllVersions } = (await import('./get-versions-request'));
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
