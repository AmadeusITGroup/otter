jest.mock('../manifest/manifest-auth.mjs', () => ({}));
jest.mock('../manifest/manifest.mjs', () => ({
  isDependencyArtifact: jest.fn((obj: any) => obj && typeof obj === 'object' && obj.version && Array.isArray(obj.models)),
  isDependencyLink: jest.fn((obj: any) => obj && typeof obj === 'object' && obj.link)
}));

import { downloadDependency } from './retrieve-specification.mjs';
import { downloadDependencyModels } from './retrieve-artifact.mjs';
import { downloadDependencyLink } from './retrieve-link.mjs';
import type { DependencyArtifact, DependencyLink } from '../manifest/manifest.mjs';
import type { ManifestAuth } from '../public_api.mjs';

jest.mock('./retrieve-artifact.mjs', () => ({
  downloadDependencyModels: jest.fn()
}));

jest.mock('./retrieve-link.mjs', () => ({
  downloadDependencyLink: jest.fn()
}));

describe('downloadDependency', () => {
  const mockManifestAuth: ManifestAuth = {
    registries: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with DependencyArtifact', () => {
    it('should call downloadDependencyModels for artifact dependency', () => {
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: [
          {
            name: 'TestModel',
            source: 'models/test.json'
          }
        ]
      };
      const mockResult = [Promise.resolve({
        url: 'https://example.com/test.json',
        content: '{}',
        dependency,
        model: dependency.models[0]
      })];

      (downloadDependencyModels as jest.Mock).mockReturnValue(mockResult);

      const result = downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyModels).toHaveBeenCalledWith(dependency, mockManifestAuth, undefined);
      expect(result).toBe(mockResult);
    });

    it('should pass options to downloadDependencyModels', () => {
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const options = {
        logger: console
      };
      const mockResult = [Promise.resolve({
        url: 'https://example.com/test.json',
        content: '{}',
        dependency
      })];

      (downloadDependencyModels as jest.Mock).mockReturnValue(mockResult);

      downloadDependency(dependency, mockManifestAuth, options);

      expect(downloadDependencyModels).toHaveBeenCalledWith(dependency, mockManifestAuth, options);
    });

    it('should handle artifact dependency with multiple models', () => {
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: [
          {
            name: 'Model1',
            source: 'models/model1.json'
          },
          {
            name: 'Model2',
            source: 'models/model2.json'
          }
        ]
      };
      const mockResult = [
        Promise.resolve({
          url: 'https://example.com/model1.json',
          content: '{}',
          dependency,
          model: dependency.models[0]
        }),
        Promise.resolve({
          url: 'https://example.com/model2.json',
          content: '{}',
          dependency,
          model: dependency.models[1]
        })
      ];

      (downloadDependencyModels as jest.Mock).mockReturnValue(mockResult);

      const result = downloadDependency(dependency, mockManifestAuth);

      expect(result).toHaveLength(2);
      expect(downloadDependencyModels).toHaveBeenCalledWith(dependency, mockManifestAuth, undefined);
    });
  });

  describe('with DependencyLink', () => {
    it('should call downloadDependencyLink for link dependency', () => {
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json'
      };
      const mockResult = [Promise.resolve({
        url: dependency.link,
        content: '{}',
        dependency
      })];

      (downloadDependencyLink as jest.Mock).mockReturnValue(mockResult);

      const result = downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyLink).toHaveBeenCalledWith(dependency, mockManifestAuth, undefined);
      expect(result).toBe(mockResult);
    });

    it('should pass options to downloadDependencyLink', () => {
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json'
      };
      const options = {
        logger: console
      };
      const mockResult = [Promise.resolve({
        url: dependency.link,
        content: '{}',
        dependency
      })];

      (downloadDependencyLink as jest.Mock).mockReturnValue(mockResult);

      downloadDependency(dependency, mockManifestAuth, options);

      expect(downloadDependencyLink).toHaveBeenCalledWith(dependency, mockManifestAuth, options);
    });

    it('should handle link dependency with mask', () => {
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json',
        mask: {
          properties: {
            name: true
          }
        }
      };
      const mockResult = [Promise.resolve({
        url: dependency.link,
        content: '{}',
        dependency
      })];

      (downloadDependencyLink as jest.Mock).mockReturnValue(mockResult);

      const result = downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyLink).toHaveBeenCalledWith(dependency, mockManifestAuth, undefined);
      expect(result).toBe(mockResult);
    });

    it('should handle GitHub link', () => {
      const dependency: DependencyLink = {
        name: 'github-spec',
        link: 'https://github.com/owner/repo/raw/refs/heads/main/spec.json'
      };
      const mockResult = [Promise.resolve({
        url: dependency.link,
        content: '{}',
        dependency
      })];

      (downloadDependencyLink as jest.Mock).mockReturnValue(mockResult);

      downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyLink).toHaveBeenCalledWith(dependency, mockManifestAuth, undefined);
    });
  });

  describe('type detection', () => {
    it('should correctly identify artifact dependency by version and models', () => {
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };

      (downloadDependencyModels as jest.Mock).mockReturnValue([]);

      downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyModels).toHaveBeenCalled();
      expect(downloadDependencyLink).not.toHaveBeenCalled();
    });

    it('should correctly identify link dependency by link property', () => {
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json'
      };

      (downloadDependencyLink as jest.Mock).mockReturnValue([]);

      downloadDependency(dependency, mockManifestAuth);

      expect(downloadDependencyLink).toHaveBeenCalled();
      expect(downloadDependencyModels).not.toHaveBeenCalled();
    });
  });

  describe('with authentication', () => {
    it('should pass manifest auth to download functions', () => {
      const manifestAuthWithToken: ManifestAuth = {
        registries: [
          {
            url: 'https://private-registry.com',
            authToken: 'test-token'
          }
        ]
      };
      const dependency: DependencyArtifact = {
        artifact: 'private-artifact',
        version: '1.0.0',
        models: [],
        registry: 'https://private-registry.com'
      };

      (downloadDependencyModels as jest.Mock).mockReturnValue([]);

      downloadDependency(dependency, manifestAuthWithToken);

      expect(downloadDependencyModels).toHaveBeenCalledWith(dependency, manifestAuthWithToken, undefined);
    });
  });
});
