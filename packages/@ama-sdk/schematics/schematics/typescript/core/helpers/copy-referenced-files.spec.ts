import {
  readFile
} from 'node:fs/promises';
import {
  dirname,
  join
} from 'node:path';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem
} from '@o3r/test-helpers';

describe('Specs processing', () => {
  const virtualFileSystem = useVirtualFileSystem();
  const { copyReferencedFiles, updateLocalRelativeRefs } = require('./copy-referenced-files');

  const specsMocksPath = join(__dirname, '../../../../testing/mocks');
  const specFilePath = '../models/split-spec/split-spec.yaml';
  const outputDirectory = './local-references';

  const copyMockFile = async (virtualPath: string, realPath: string) => {
    if (!virtualFileSystem.existsSync(dirname(virtualPath))) {
      await virtualFileSystem.promises.mkdir(dirname(virtualPath), { recursive: true });
    }
    await virtualFileSystem.promises.writeFile(virtualPath, await readFile(join(specsMocksPath, realPath), { encoding: 'utf8' }));
  };

  beforeAll(async () => {
    await virtualFileSystem.promises.mkdir(dirname(specFilePath), { recursive: true });
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
    expect(baseRelativePath).toMatch(/^local-references[/\\]split-spec$/);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'split-spec/split-spec.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'split-spec/spec-chunk1.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk2.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk3/spec-chunk3.yaml'))).toBe(true);
    expect(virtualFileSystem.existsSync(join(outputDirectory, 'spec-chunk4/spec-chunk4.yaml'))).toBe(true);
  });

  it('should update with new local basepath', async () => {
    const specWitheRelativesFilePath = 'split-spec/split-spec.yaml';
    const expectedSpecWitheRelativesFilePath = 'split-spec/spec-with-updated-paths.yaml';
    const expectedContent = await readFile(join(specsMocksPath, expectedSpecWitheRelativesFilePath), { encoding: 'utf8' });
    const specContent = await readFile(join(specsMocksPath, specWitheRelativesFilePath), { encoding: 'utf8' });

    const baseRelativePath = await copyReferencedFiles(specFilePath, './output-local-directory');
    const newSpecContent = await updateLocalRelativeRefs(specContent, baseRelativePath);
    expect(newSpecContent).toBe(expectedContent);
  });
});
