import {
  resolve,
} from 'node:path';
import {
  getTargetFiles,
} from './target-file.filter.mjs';

describe('getTargetFiles', () => {
  test('should propagate format', () => {
    const format = 'test-format';
    const results = getTargetFiles({ example: 'file.css', example2: 'file2.css' }, { format });
    expect(results).toHaveLength(2);
    expect(results.every((file) => file.format && file.format === format)).toBe(true);
  });

  test('should calculate destination path based on root', () => {
    const rootPath = '/root/path';
    const results = getTargetFiles({ example: 'file.css' }, { rootPath });
    expect(results).toHaveLength(1);
    expect(results[0].destination).toBe(resolve(rootPath, 'file.css'));
  });

  test('should support $extensions for legacy configuration', () => {
    const rootPath = '/root/path';
    const results = getTargetFiles({ example: { $extensions: { o3rTargetFile: 'file.css', toIgnore: 'otherFile.css' } } }, { rootPath });
    expect(results).toHaveLength(1);
    expect(results[0].destination).toBe(resolve(rootPath, 'file.css'));
  });

  test('should regroup files from different rules', () => {
    const results = getTargetFiles({ example1: 'file1.css', example2: 'file2.css', example3: 'file1.css' });
    expect(results).toHaveLength(2);
    expect(results.every((file) => ['file1.css', 'file2.css'].includes(file.destination))).toBe(true);
  });
});
