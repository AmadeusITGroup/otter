jest.mock('../manifest/manifest-auth.mjs', () => ({}));
jest.mock('../manifest/manifest.mjs', () => ({
  isDependencyLink: jest.fn((obj: any) => obj && typeof obj === 'object' && obj.link)
}));

import { transform } from './transform.mjs';
import type { DependencyArtifact, DependencyLink, Model } from '../manifest/manifest.mjs';

describe('transform', () => {
  const testUrl = 'https://example.com/api/spec.json';

  describe('with JSON format', () => {
    it('should apply mask from model for artifact dependency', () => {
      const modelPath = '';
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const model: Model = {
        name: 'TestModel',
        source: 'models/test.json',
        mask: {
          properties: {
            name: true
          }
        }
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      });

      const result = transform(modelContent, {dependency, url: testUrl, model, modelPath});
      const parsed = JSON.parse(result);

      expect(parsed.properties.name).toBeDefined();
      expect(parsed.properties.email).toBeUndefined();
      expect(parsed['x-internal-masked']).toBe(true);
      expect(parsed['x-internal-source']).toBe(testUrl);
    });

    it('should apply mask from dependency link when model is not provided', () => {
      const modelPath = '';
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json',
        mask: {
          properties: {
            id: true,
            name: true
          }
        }
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      });

      const result = transform(modelContent, { dependency, url: testUrl, modelPath });
      const parsed = JSON.parse(result);

      expect(parsed.properties.id).toBeDefined();
      expect(parsed.properties.name).toBeDefined();
      expect(parsed.properties.email).toBeUndefined();
      expect(parsed['x-internal-masked']).toBe(true);
    });

    it('should not apply mask when neither model nor dependency has mask', () => {
      const modelPath = '';
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const model: Model = {
        name: 'TestModel',
        source: 'models/test.json'
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      });

      const result = transform(modelContent, { dependency, url: testUrl, model, modelPath });
      const parsed = JSON.parse(result);

      expect(parsed.properties.name).toBeDefined();
      expect(parsed.properties.email).toBeDefined();
      expect(parsed['x-internal-masked']).toBe(false);
      expect(parsed['x-internal-source']).toBe(testUrl);
    });

    it('should prefer model mask over dependency link mask', () => {
      const modelPath = '';
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.json',
        mask: {
          properties: {
            email: true
          }
        }
      };
      const model: Model = {
        name: 'TestModel',
        source: 'models/test.json',
        mask: {
          properties: {
            name: true
          }
        }
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      });

      const result = transform(modelContent, { dependency, url: testUrl, model, modelPath });
      const parsed = JSON.parse(result);

      expect(parsed.properties.name).toBeDefined();
      expect(parsed.properties.email).toBeUndefined();
    });
  });

  describe('with YAML format', () => {
    it('should handle YAML input and output', () => {
      const modelPath = '';
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const model: Model = {
        name: 'TestModel',
        source: 'models/test.yaml',
        mask: {
          properties: {
            name: true
          }
        }
      };
      const modelContent = `
type: object
properties:
  name:
    type: string
  email:
    type: string
`;

      const result = transform(modelContent, { dependency, url: testUrl, model, modelPath });

      expect(result).toContain('type: object');
      expect(result).toContain('name:');
      expect(result).toContain('x-internal-masked: true');
      expect(result).toContain('x-internal-source: https://example.com/api/spec.json');
    });

    it('should apply mask to YAML content', () => {
      const modelPath = '';
      const dependency: DependencyLink = {
        name: 'test-link',
        link: 'https://example.com/spec.yaml',
        mask: {
          properties: {
            id: true
          }
        }
      };
      const modelContent = `
type: object
properties:
  id:
    type: string
  name:
    type: string
`;

      const result = transform(modelContent, { dependency, url: testUrl, modelPath });

      expect(result).toContain('id:');
      expect(result).not.toContain('name:');
    });
  });

  describe('edge cases', () => {
    it('should handle artifact dependency without model', () => {
      const modelPath = '';
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      });

      const result = transform(modelContent, { dependency, url: testUrl, modelPath });
      const parsed = JSON.parse(result);

      expect(parsed['x-internal-masked']).toBe(false);
      expect(parsed.properties.name).toBeDefined();
    });

    it('should handle complex nested structures with mask', () => {
      const modelPath = '';
      const dependency: DependencyArtifact = {
        artifact: 'test-artifact',
        version: '1.0.0',
        models: []
      };
      const model: Model = {
        name: 'TestModel',
        source: 'models/test.json',
        mask: {
          properties: {
            name: true,
            email: true
          }
        }
      };
      const modelContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' }
        }
      });

      const result = transform(modelContent, { dependency, url: testUrl, model, modelPath });
      const parsed = JSON.parse(result);

      expect(parsed.properties.name).toBeDefined();
      expect(parsed.properties.email).toBeDefined();
      expect(parsed.properties.password).toBeUndefined();
    });
  });
});
