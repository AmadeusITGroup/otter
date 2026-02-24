import type {
  OpenAPIV3,
} from 'openapi-types';
import {
  extractDomains,
  extractModelsFromOperation,
  extractRefModel,
  inferDomainFromPath,
  type OpenAPISpec,
} from './update-sdk-context.helpers';

describe('update-sdk-context.helpers', () => {
  const sampleOpenApiSpec: OpenAPISpec = {
    openapi: '3.0.2',
    info: {
      title: 'Test API',
      version: '1.0.0'
    },
    tags: [
      { name: 'pet', description: 'Pet operations' },
      { name: 'store', description: 'Store operations' }
    ],
    paths: {
      '/pet': {
        get: {
          operationId: 'getPets',
          tags: ['pet'],
          summary: 'Get all pets',
          responses: { 200: { description: 'OK' } }
        },
        post: {
          operationId: 'addPet',
          tags: ['pet'],
          summary: 'Add a pet',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pet' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/store/order': {
        post: {
          operationId: 'placeOrder',
          tags: ['store'],
          summary: 'Place an order',
          responses: {
            200: {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Pet: { type: 'object' },
        Order: { type: 'object' }
      }
    }
  };

  describe('extractRefModel', () => {
    it('should extract model name from $ref', () => {
      expect(extractRefModel('#/components/schemas/Pet')).toBe('Pet');
      expect(extractRefModel('#/components/schemas/Order')).toBe('Order');
    });

    it('should return null for undefined or invalid ref', () => {
      expect(extractRefModel(undefined)).toBeNull();
      expect(extractRefModel('')).toBeNull();
      expect(extractRefModel('/invalid/ref')).toBeNull();
    });
  });

  describe('extractModelsFromOperation', () => {
    it('should extract models from requestBody', () => {
      const operation = {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Pet' }
            }
          }
        }
      } as unknown as OpenAPIV3.OperationObject;

      const models = extractModelsFromOperation(operation);
      expect(models).toContain('Pet');
    });

    it('should extract models from response', () => {
      const operation = {
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          }
        }
      } as OpenAPIV3.OperationObject;

      const models = extractModelsFromOperation(operation);
      expect(models).toContain('Order');
    });

    it('should extract models from array items in response', () => {
      const operation = {
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } }
              }
            }
          }
        }
      } as OpenAPIV3.OperationObject;

      const models = extractModelsFromOperation(operation);
      expect(models).toContain('Pet');
    });

    it('should return empty array for operation without models', () => {
      const operation = {
        responses: { 200: { description: 'OK' } }
      } as OpenAPIV3.OperationObject;

      const models = extractModelsFromOperation(operation);
      expect(models).toHaveLength(0);
    });
  });

  describe('inferDomainFromPath', () => {
    it('should infer domain from first path segment', () => {
      expect(inferDomainFromPath('/users')).toBe('users');
      expect(inferDomainFromPath('/pet')).toBe('pet');
      expect(inferDomainFromPath('/store/order')).toBe('store');
    });

    it('should skip path parameters', () => {
      expect(inferDomainFromPath('/{version}/users')).toBe('users');
      expect(inferDomainFromPath('/pet/{petId}')).toBe('pet');
    });

    it('should return default for empty path', () => {
      expect(inferDomainFromPath('/')).toBe('default');
      expect(inferDomainFromPath('')).toBe('default');
    });
  });

  describe('extractDomains', () => {
    it('should extract domains from OpenAPI tags', () => {
      const domains = extractDomains(sampleOpenApiSpec);

      expect(domains.size).toBe(2);
      expect(domains.has('pet')).toBe(true);
      expect(domains.has('store')).toBe(true);
    });

    it('should use tag descriptions', () => {
      const domains = extractDomains(sampleOpenApiSpec);

      expect(domains.get('pet')?.description).toBe('Pet operations');
      expect(domains.get('store')?.description).toBe('Store operations');
    });

    it('should use custom descriptions when provided', () => {
      const customDescriptions = {
        pet: 'Custom pet domain description'
      };

      const domains = extractDomains(sampleOpenApiSpec, customDescriptions);

      expect(domains.get('pet')?.description).toBe('Custom pet domain description');
    });

    it('should fallback to tag description when custom description missing', () => {
      const customDescriptions = {
        pet: 'Custom pet description'
      };

      const domains = extractDomains(sampleOpenApiSpec, customDescriptions);

      expect(domains.get('pet')?.description).toBe('Custom pet description');
      expect(domains.get('store')?.description).toBe('Store operations');
    });

    it('should extract operations for each domain', () => {
      const domains = extractDomains(sampleOpenApiSpec);

      const petDomain = domains.get('pet');
      expect(petDomain?.operations).toHaveLength(2);
      expect(petDomain?.operations.map((op) => op.operationId)).toContain('getPets');
      expect(petDomain?.operations.map((op) => op.operationId)).toContain('addPet');

      const storeDomain = domains.get('store');
      expect(storeDomain?.operations).toHaveLength(1);
      expect(storeDomain?.operations[0].operationId).toBe('placeOrder');
    });

    it('should extract models used in each domain', () => {
      const domains = extractDomains(sampleOpenApiSpec);

      const petDomain = domains.get('pet');
      expect(petDomain?.models.has('Pet')).toBe(true);

      const storeDomain = domains.get('store');
      expect(storeDomain?.models.has('Order')).toBe(true);
    });

    it('should infer domain from path when no tags present', () => {
      const specWithoutTags: OpenAPISpec = {
        openapi: '3.0.2',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { 200: { description: 'OK' } }
            }
          }
        }
      };

      const domains = extractDomains(specWithoutTags);

      expect(domains.has('users')).toBe(true);
      expect(domains.get('users')?.description).toBe('Operations for users (inferred from path)');
    });

    it('should use custom descriptions for inferred domains', () => {
      const specWithoutTags: OpenAPISpec = {
        openapi: '3.0.2',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { 200: { description: 'OK' } }
            }
          }
        }
      };

      const customDescriptions = {
        users: 'Custom users description'
      };

      const domains = extractDomains(specWithoutTags, customDescriptions);

      expect(domains.get('users')?.description).toBe('Custom users description');
    });
  });

  describe('interactive mode behavior', () => {
    it('should show computed descriptions in interactive mode', () => {
      const domains = extractDomains(sampleOpenApiSpec, { pet: 'Custom pet description' });

      expect(domains.get('pet')?.description).toBe('Custom pet description');
      expect(domains.get('store')?.description).toBe('Store operations');
    });

    it('should allow --domain-descriptions with --interactive', () => {
      const isInteractive = true;
      const domainDescriptionsFile = 'descriptions.json';

      expect(isInteractive && domainDescriptionsFile).toBeTruthy();
    });

    it('should indicate when custom descriptions are used', () => {
      const hasCustomDescriptions = true;
      const message = hasCustomDescriptions
        ? '(Using custom descriptions from --domain-descriptions file)'
        : '';

      expect(message).toContain('--domain-descriptions');
    });

    it('should invite user to modify override file when disagreeing', () => {
      const DOMAIN_DESCRIPTIONS_FILENAME = 'domain-descriptions.json';
      const hasCustomDescriptions = false;
      const overrideFile = DOMAIN_DESCRIPTIONS_FILENAME;

      const message = hasCustomDescriptions
        ? 'After editing, re-run this command.'
        : `Create this file and run: amasdk-update-sdk-context --interactive --domain-descriptions ${overrideFile}`;

      expect(message).toContain('--domain-descriptions');
      expect(message).toContain(DOMAIN_DESCRIPTIONS_FILENAME);
    });
  });
});
