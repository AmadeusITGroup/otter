import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import {
  tmpdir,
} from 'node:os';
import * as path from 'node:path';
import {
  cloneNodeModules,
  findNodeModulesFolders,
} from './clone-node-modules';

describe('cloneNodeModules', () => {
  let rootPath: string;
  let sourcePath: string;
  let destinationPath: string;

  const writeFile = (filePath: string, content = filePath) => {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  };

  beforeEach(() => {
    rootPath = mkdtempSync(path.join(tmpdir(), 'clone-node-modules-'));
    sourcePath = path.join(rootPath, 'source');
    destinationPath = path.join(rootPath, 'destination');

    writeFile(path.join(sourcePath, 'package.json'), '{}');
    writeFile(path.join(sourcePath, 'libs', 'my-lib', 'package.json'), '{}');
    writeFile(path.join(sourcePath, 'node_modules', 'my-dep', 'index.js'));
    writeFile(path.join(sourcePath, 'node_modules', 'my-dep', 'binding.node'));
    writeFile(path.join(sourcePath, 'node_modules', '.package-lock.json'), '{}');
    writeFile(path.join(sourcePath, 'node_modules', '.cache', 'tool', 'cache.json'));
    writeFile(path.join(sourcePath, 'node_modules', 'other-dep', '.cache', 'index.js'));
    writeFile(path.join(sourcePath, 'libs', 'my-lib', 'node_modules', 'nested-dep', 'index.js'));
    writeFile(path.join(sourcePath, '.git', 'node_modules', 'ignored.js'));
    symlinkSync(path.join('..', 'libs', 'my-lib'), path.join(sourcePath, 'node_modules', 'my-lib'), 'junction');
    const pastDate = new Date(Date.now() - 60_000);
    utimesSync(path.join(sourcePath, 'node_modules', '.package-lock.json'), pastDate, pastDate);

    writeFile(path.join(destinationPath, 'package.json'), '{}');
    writeFile(path.join(destinationPath, 'libs', 'my-lib', 'package.json'), '{}');
  });

  afterEach(() => {
    rmSync(rootPath, { recursive: true, force: true });
  });

  test('should find root and nested node_modules folders only', () => {
    expect(findNodeModulesFolders(sourcePath).toSorted()).toEqual([
      path.join('libs', 'my-lib', 'node_modules'),
      'node_modules'
    ]);
  });

  test('should hard link the installed files', () => {
    const result = cloneNodeModules(sourcePath, destinationPath);

    const clonedFile = path.join(destinationPath, 'node_modules', 'my-dep', 'index.js');
    expect(statSync(clonedFile).ino).toBe(statSync(path.join(sourcePath, 'node_modules', 'my-dep', 'index.js')).ino);
    expect(readFileSync(path.join(destinationPath, 'libs', 'my-lib', 'node_modules', 'nested-dep', 'index.js'), { encoding: 'utf8' }))
      .toBe(path.join(sourcePath, 'libs', 'my-lib', 'node_modules', 'nested-dep', 'index.js'));
    expect(result.nodeModulesFolders).toHaveLength(2);
    expect(result.hardLinkedFiles).toBe(3);
  });

  test('should copy the files which could be modified in place or locked', () => {
    const result = cloneNodeModules(sourcePath, destinationPath);

    ['.package-lock.json', path.join('my-dep', 'binding.node')].forEach((file) => {
      expect(statSync(path.join(destinationPath, 'node_modules', file)).ino).not.toBe(statSync(path.join(sourcePath, 'node_modules', file)).ino);
    });
    expect(result.copiedFiles).toBe(2);
  });

  test('should refresh the npm hidden lockfile modification date', () => {
    cloneNodeModules(sourcePath, destinationPath);

    const hiddenLockfileTime = statSync(path.join(destinationPath, 'node_modules', '.package-lock.json')).mtimeMs;
    // npm considers the hidden lockfile outdated when a package folder is more than 10ms newer
    expect(hiddenLockfileTime + 10).toBeGreaterThan(statSync(path.join(destinationPath, 'node_modules', 'my-dep')).mtimeMs);
    expect(hiddenLockfileTime).toBeGreaterThan(statSync(path.join(sourcePath, 'node_modules', '.package-lock.json')).mtimeMs);
  });

  test('should not clone the tools caches at the root of the node_modules', () => {
    cloneNodeModules(sourcePath, destinationPath);

    expect(existsSync(path.join(destinationPath, 'node_modules', '.cache'))).toBe(false);
    expect(existsSync(path.join(destinationPath, 'node_modules', 'other-dep', '.cache', 'index.js'))).toBe(true);
    expect(existsSync(path.join(destinationPath, '.git'))).toBe(false);
  });

  test('should remap the links targeting the source project to the destination project', () => {
    const result = cloneNodeModules(sourcePath, destinationPath);

    const clonedLink = path.join(destinationPath, 'node_modules', 'my-lib');
    expect(lstatSync(clonedLink).isSymbolicLink()).toBe(true);
    expect(realpathSync(clonedLink)).toBe(realpathSync(path.join(destinationPath, 'libs', 'my-lib')));
    expect(result.symbolicLinks).toBe(1);
  });

  test('should keep the relative links relative (Windows junctions are always absolute)', () => {
    cloneNodeModules(sourcePath, destinationPath);

    expect(path.isAbsolute(readlinkSync(path.join(destinationPath, 'node_modules', 'my-lib')))).toBe(process.platform === 'win32');
  });
});
