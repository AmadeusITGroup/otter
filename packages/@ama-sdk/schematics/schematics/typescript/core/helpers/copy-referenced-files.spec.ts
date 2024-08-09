import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

describe('Copy Referenced Files', () => {
  const virtualFileSystem = useVirtualFileSystem();
  const copyReferencedFiles = require('./copy-referenced-files').copyReferencedFiles;

  const migrationScriptMocksPath = join(__dirname, '../../../../testing/mocks');
  const specFilePath = '../models/split-spec/split-spec.yaml';
  const outputDirectory = './local-references';

  const copyMockFile = async (virtualPath: string, realPath: string) => {
    if (!virtualFileSystem.existsSync(dirname(virtualPath))) {
      await virtualFileSystem.promises.mkdir(dirname(virtualPath), {recursive: true});
    }
    await virtualFileSystem.promises.writeFile(virtualPath, await readFile(join(migrationScriptMocksPath, realPath), {encoding: 'utf8'}));
  };

  beforeAll(async () => {
    await virtualFileSystem.promises.mkdir(dirname(specFilePath), {recursive: true});
    await copyMockFile(specFilePath, 'split-spec/split-spec.yaml');
    await copyMockFile('../models/split-spec/spec-chunk1.yaml', 'split-spec/spec-chunk1.yaml');
    await copyMockFile('../models/spec-chunk2.yaml', 'spec-chunk2.yaml');
    await copyMockFile('../models/spec-chunk3/spec-chunk3.yaml', 'spec-chunk3/spec-chunk3.yaml');
    await copyMockFile('../models/spec-chunk4/spec-chunk4.yaml', 'spec-chunk4/spec-chunk4.yaml');
  });

  afterAll(() => {
    cleanVirtualFileSystem();
  });

  it('should copy the local files referenced in the spec', async () => {
    const baseRelativePath = await copyReferencedFiles(specFilePath, outputDirectory);
    expect(baseRelativePath).toMatch(/^local-references[\\/]split-spec$/);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'split-spec/split-spec.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'split-spec/spec-chunk1.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk2.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk3/spec-chunk3.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk4/spec-chunk4.yaml'))).toBe(true);
  });
});
