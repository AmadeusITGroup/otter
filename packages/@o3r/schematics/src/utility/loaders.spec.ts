import {
  EmptyTree,
} from '@angular-devkit/schematics';
import {
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  findFilesInTree,
} from './loaders';

describe('findFilesInTree', () => {
  let tree: UnitTestTree;

  beforeEach(() => {
    tree = new UnitTestTree(new EmptyTree());
  });

  test('should find files matching the criteria', () => {
    tree.create('/src/foo.ts', 'content');
    tree.create('/src/bar.ts', 'content');
    tree.create('/src/readme.md', 'content');
    const files = findFilesInTree(tree.root, (file) => file.endsWith('.ts'));
    const paths = files.map((f) => f.path);
    expect(paths).toContain('/src/foo.ts');
    expect(paths).toContain('/src/bar.ts');
    expect(paths).not.toContain('/src/readme.md');
  });

  test('should ignore node_modules by default', () => {
    tree.create('/node_modules/some-pkg/index.ts', 'content');
    const files = findFilesInTree(tree.root, (file) => file.endsWith('.ts'));
    expect(files).toHaveLength(0);
  });

  test('should ignore .git by default', () => {
    tree.create('/.git/objects/pack/0.pack', 'binary');
    const files = findFilesInTree(tree.root, () => true);
    expect(files).toHaveLength(0);
  });

  test('should ignore .yarn by default', () => {
    tree.create('/.yarn/cache/pkg.zip', 'content');
    const files = findFilesInTree(tree.root, () => true);
    expect(files).toHaveLength(0);
  });

  test('should ignore .angular by default', () => {
    tree.create('/.angular/cache/some-cached-file.json', 'content');
    const files = findFilesInTree(tree.root, () => true);
    expect(files).toHaveLength(0);
  });

  test('should not ignore .angular when ignoreDirectories is overridden', () => {
    tree.create('/.angular/cache/some-cached-file.json', 'content');
    const files = findFilesInTree(tree.root, () => true, []);
    expect(files).toHaveLength(1);
  });

  test('should respect custom ignoreDirectories', () => {
    tree.create('/dist/output.js', 'content');
    tree.create('/src/index.ts', 'content');
    const files = findFilesInTree(tree.root, () => true, ['dist']);
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain('/dist/output.js');
    expect(paths).toContain('/src/index.ts');
  });

  test('should return FileEntry objects with accessible path and content', () => {
    tree.create('/src/hello.ts', 'export const x = 1;');
    const files = findFilesInTree(tree.root, (file) => file === 'hello.ts');
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('/src/hello.ts');
    expect(files[0].content.toString()).toBe('export const x = 1;');
  });
});
