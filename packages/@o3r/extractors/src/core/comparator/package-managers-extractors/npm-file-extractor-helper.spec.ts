const mockSpawnSync = jest.fn();
jest.mock('node:child_process', () => ({
  spawnSync: mockSpawnSync
}));

const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockRmSync = jest.fn();
jest.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  readFileSync: mockReadFileSync,
  rmSync: mockRmSync
}));

jest.mock('node:os', () => ({
  tmpdir: () => '/tmp'
}));

jest.mock('node:crypto', () => ({
  randomBytes: () => ({ toString: () => 'abcdef' })
}));

// eslint-disable-next-line import/first -- needed for `jest.mock`
import type {
  SpawnSyncReturns,
} from 'node:child_process';
// eslint-disable-next-line import/first -- needed for `jest.mock`
import {
  getFilesFromRegistry,
} from './npm-file-extractor-helper';

const mockSpawnResult = (stdout: string, status = 0): SpawnSyncReturns<string> => ({
  pid: 0,
  output: [stdout],
  stdout,
  stderr: '',
  status,
  signal: null
});

const mockSpawnError = (): SpawnSyncReturns<string> => ({
  pid: 0,
  output: [''],
  stdout: '',
  stderr: 'some error',
  status: 1,
  signal: null,
  error: new Error('fail')
});

describe('getFilesFromRegistry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sort versions in descending order and pick the latest', async () => {
    const versions = ['1.0.0', '1.3.0', '1.1.0', '1.2.0'];

    mockSpawnSync
      .mockReturnValueOnce(mockSpawnResult(JSON.stringify(versions)))
      .mockReturnValueOnce(mockSpawnResult('package.tgz'))
      .mockReturnValueOnce(mockSpawnResult(''));

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(Buffer.from('file-content'));

    const result = await getFilesFromRegistry('@o3r/demo@^1.0.0', ['some-file.json']);

    // The npm pack call should use the latest matching version (1.3.0)
    const npmPackCall = mockSpawnSync.mock.calls[1]![0] as string;
    expect(npmPackCall).toContain('@o3r/demo@1.3.0');
    expect(result['some-file.json']).toBe('file-content');
  });

  it('should handle a single version string from npm view', async () => {
    mockSpawnSync
      .mockReturnValueOnce(mockSpawnResult(JSON.stringify('1.0.0')))
      .mockReturnValueOnce(mockSpawnResult('package.tgz'))
      .mockReturnValueOnce(mockSpawnResult(''));

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(Buffer.from('content'));

    const result = await getFilesFromRegistry('@o3r/demo', ['file.json']);

    const npmPackCall = mockSpawnSync.mock.calls[1]![0] as string;
    expect(npmPackCall).toContain('@o3r/demo@1.0.0');
    expect(result['file.json']).toBe('content');
  });

  it('should filter versions by range and sort descending', async () => {
    const versions = ['1.0.0', '2.0.0', '3.0.0', '1.0.5', '1.0.3'];

    mockSpawnSync
      .mockReturnValueOnce(mockSpawnResult(JSON.stringify(versions)))
      .mockReturnValueOnce(mockSpawnResult('package.tgz'))
      .mockReturnValueOnce(mockSpawnResult(''));

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(Buffer.from('content'));

    await getFilesFromRegistry('@o3r/demo@~1.0.0', ['file.json']);

    // ~1.0.0 matches >=1.0.0 <1.1.0: 1.0.0, 1.0.3, 1.0.5. Latest is 1.0.5
    const npmPackCall = mockSpawnSync.mock.calls[1]![0] as string;
    expect(npmPackCall).toContain('@o3r/demo@1.0.5');
  });

  it('should clean up temp directory even on error', async () => {
    mockSpawnSync.mockReturnValueOnce(mockSpawnError());

    await expect(getFilesFromRegistry('@o3r/demo', ['file.json'])).rejects.toThrow();
    expect(mockRmSync).toHaveBeenCalled();
  });
});
