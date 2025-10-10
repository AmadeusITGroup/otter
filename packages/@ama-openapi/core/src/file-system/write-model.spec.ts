import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';

jest.mock('../manifest/manifest-auth.mjs', () => ({}));
jest.mock('../manifest/manifest.mjs', () => ({
  isDependencyArtifact: jest.fn((obj: any) => obj && typeof obj === 'object' && obj.version && Array.isArray(obj.models)),
  isDependencyLink: jest.fn((obj: any) => obj && typeof obj === 'object' && obj.link)
}));

import { writeModelFile } from './write-model.mjs';
import type { Manifest, DependencyArtifact, DependencyLink, Model } from '../manifest/manifest.mjs';

jest.mock('node:fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('writeModelFile', () => {
  const mockManifest: Manifest = {
    name: 'test-manifest',
    dependencyOutput: '/test/output',
    registry: 'https://test-registry.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  describe('with DependencyArtifact', () => {
    const mockDependency: DependencyArtifact = {
      artifact: 'test-artifact',
      version: '1.0.0',
      models: [],
      name: 'test-dependency'
    };

    const mockModel: Model = {
      name: 'TestModel',
      source: 'models/test.json'
    };

    it('should create directory and write file for artifact dependency with model', async () => {
      const content = '{"test": "content"}';

      await writeModelFile(mockManifest, mockDependency, mockModel, content);

      expect(fs.mkdir).toHaveBeenCalledWith(
        resolve('/test/output', 'test-dependency'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        resolve('/test/output', 'test-dependency', 'TestModel.json'),
        content,
        { encoding: 'utf8' }
      );
    });

    it('should use artifact name when dependency name is not provided', async () => {
      const dependencyWithoutName: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const content = '{"test": "content"}';

      await writeModelFile(mockManifest, dependencyWithoutName, mockModel, content);

      expect(fs.mkdir).toHaveBeenCalledWith(
        resolve('/test/output', 'test-artifact'),
        { recursive: true }
      );
    });

    it('should handle yaml file extension', async () => {
      const yamlModel: Model = {
        name: 'TestModel',
        source: 'models/test.yaml'
      };
      const content = 'test: content';

      await writeModelFile(mockManifest, mockDependency, yamlModel, content);

      expect(fs.writeFile).toHaveBeenCalledWith(
        resolve('/test/output', 'test-dependency', 'TestModel.yaml'),
        content,
        { encoding: 'utf8' }
      );
    });

    it('should throw error when model is not provided for artifact dependency', async () => {
      const content = '{"test": "content"}';

      await expect(writeModelFile(mockManifest, mockDependency, undefined, content))
        .rejects.toThrow('No file name found for the dependency test-dependency:undefined');
    });
  });

  describe('with DependencyLink', () => {
    it('should write file for GitHub link dependency', async () => {
      const githubDependency: DependencyLink = {
        name: 'github-dependency',
        link: 'https://github.com/owner/repo/raw/refs/heads/main/path/to/spec.json'
      };
      const content = '{"test": "content"}';

      await writeModelFile(mockManifest, githubDependency, undefined, content);

      expect(fs.mkdir).toHaveBeenCalledWith(
        resolve('/test/output', join('repo', 'path', 'to')),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        resolve('/test/output', join('repo', 'path', 'to'), 'spec.json'),
        content,
        { encoding: 'utf8' }
      );
    });

    it('should write file for raw.githubusercontent.com link', async () => {
      const rawGithubDependency: DependencyLink = {
        name: 'raw-github-dependency',
        link: 'https://raw.githubusercontent.com/owner/repo/main/path/to/spec.yaml'
      };
      const content = 'test: content';

      await writeModelFile(mockManifest, rawGithubDependency, undefined, content);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('spec.yaml'),
        content,
        { encoding: 'utf8' }
      );
    });

    it('should handle non-GitHub link with raw/reference path', async () => {
      const otherDependency: DependencyLink = {
        name: 'other-dependency',
        link: 'https://example.com/other-repo/raw/reference/v1/spec.json'
      };
      const content = '{"test": "content"}';

      await writeModelFile(mockManifest, otherDependency, undefined, content);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('spec.json'),
        content,
        { encoding: 'utf8' }
      );
    });
  });

  describe('error handling', () => {
    it('should continue when mkdir fails due to existing directory', async () => {
      const mockDependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: [],
        name: 'test-dependency'
      };
      const mockModel: Model = {
        name: 'TestModel',
        source: 'models/test.json'
      };
      const content = '{"test": "content"}';

      (fs.mkdir as jest.Mock).mockRejectedValue(new Error('Directory exists'));

      await writeModelFile(mockManifest, mockDependency, mockModel, content);

      expect(fs.writeFile).toHaveBeenCalled();
    });
  });
});
