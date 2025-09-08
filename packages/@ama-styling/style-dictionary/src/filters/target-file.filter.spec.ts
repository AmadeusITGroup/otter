import {
  resolve,
} from 'node:path';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  getTargetFiles,
} from './target-file.filter.mjs';

jest.mock('style-dictionary', () => ({}));

describe('getTargetFiles', () => {
  test('should propagate format', () => {
    const format = 'test-format';
    const styleDictionary: any = { registerFilter: jest.fn() };
    const results = getTargetFiles({ example: 'file.css', example2: 'file2.css' }, { format, styleDictionary });
    expect(results).toHaveLength(2);
    expect(results.every((file) => file.format && file.format === format)).toBe(true);
  });

  test('should calculate destination path based on root', () => {
    const rootPath = '/root/path';
    const styleDictionary: any = { registerFilter: jest.fn() };
    const results = getTargetFiles({ example: 'file.css' }, { rootPath, styleDictionary });
    expect(results).toHaveLength(1);
    expect(styleDictionary.registerFilter).toHaveBeenCalledWith(expect.objectContaining({ name: expect.stringMatching(`${OTTER_NAME_PREFIX}/filter/[a-f0-9-]{36}`) }));
    expect(results[0].destination).toBe(resolve(rootPath, 'file.css'));
  });

  test('should not support $extensions for legacy configuration anymore', () => {
    const rootPath = '/root/path';
    const styleDictionary: any = { registerFilter: jest.fn() };
    const results = getTargetFiles({ example: { $extensions: { o3rTargetFile: 'file.css', toIgnore: 'otherFile.css' } } }, { rootPath, styleDictionary });
    expect(results).toHaveLength(0);
  });

  test('should regroup files from different rules', () => {
    const styleDictionary: any = { registerFilter: jest.fn() };
    const results = getTargetFiles({ example1: 'file1.css', example2: 'file2.css', example3: 'file1.css' }, { styleDictionary });
    expect(results).toHaveLength(2);
    expect(results.every((file) => ['file1.css', 'file2.css'].includes(file.destination))).toBe(true);
  });
});
