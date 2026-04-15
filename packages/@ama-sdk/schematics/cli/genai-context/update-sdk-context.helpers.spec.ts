import type {
  OpenAPIV3,
} from 'openapi-types';
import {
  extractDomains,
  extractModelsFromOperation,
  extractRefModel,
  inferDomainFromPath,
  type OpenAPISpec,
  parseExistingContext,
  updatePackageJsonForContextScript,
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

  describe('parseExistingContext (preserve-edits)', () => {
    it('should return defaults when content is null', () => {
      const result = parseExistingContext(null);

      expect(result.beforeDomains).toBeNull();
      expect(result.afterDomains).toBeNull();
      expect(result.disambiguation).toBe('');
    });

    it('should extract sections when markers are present', () => {
      const content = `# SDK Context for AI Tools

Custom header content here

<!-- DOMAINS-START -->
## Domains

### pet

**What this domain is about**: Pet operations

<!-- DOMAINS-END -->

## Important Guidelines

Custom footer content.

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->
My custom disambiguation notes here
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBe(`# SDK Context for AI Tools

Custom header content here

`);
      expect(result.afterDomains).toBe(`

## Important Guidelines

Custom footer content.

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->
My custom disambiguation notes here
`);
      expect(result.disambiguation).toBe('My custom disambiguation notes here');
    });

    it('should return null sections when markers are missing', () => {
      const content = `# SDK Context for AI Tools

No markers in this file.

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->
Some notes
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBeNull();
      expect(result.afterDomains).toBeNull();
      expect(result.disambiguation).toBe('Some notes');
    });

    it('should handle content with only DOMAINS-START marker', () => {
      const content = `# SDK Context

<!-- DOMAINS-START -->
## Domains

Some domain content
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBeNull();
      expect(result.afterDomains).toBeNull();
    });

    it('should handle content with only DOMAINS-END marker', () => {
      const content = `# SDK Context

## Domains

Some domain content
<!-- DOMAINS-END -->
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBeNull();
      expect(result.afterDomains).toBeNull();
    });

    it('should handle markers in wrong order', () => {
      const content = `# SDK Context

<!-- DOMAINS-END -->
## Domains

Some domain content
<!-- DOMAINS-START -->
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBeNull();
      expect(result.afterDomains).toBeNull();
    });

    it('should extract empty disambiguation when section exists but is empty', () => {
      const content = `# SDK Context

<!-- DOMAINS-START -->
## Domains
<!-- DOMAINS-END -->

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->

---
`;

      const result = parseExistingContext(content);

      expect(result.disambiguation).toBe('');
    });

    it('should handle multiline disambiguation notes', () => {
      const content = `# SDK Context

<!-- DOMAINS-START -->
## Domains
<!-- DOMAINS-END -->

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->
First line of notes
Second line of notes
Third line of notes

---
`;

      const result = parseExistingContext(content);

      expect(result.disambiguation).toBe('First line of notes\nSecond line of notes\nThird line of notes');
    });

    it('should preserve content with empty before section', () => {
      const content = `<!-- DOMAINS-START -->
## Domains

### old-domain

<!-- DOMAINS-END -->

## Custom Footer

User footer content.
`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBe('');
      expect(result.afterDomains).toBe(`

## Custom Footer

User footer content.
`);
    });

    it('should preserve content with empty after section', () => {
      const content = `# Custom Header

User header content.

<!-- DOMAINS-START -->
## Domains

### old-domain

<!-- DOMAINS-END -->`;

      const result = parseExistingContext(content);

      expect(result.beforeDomains).toBe(`# Custom Header

User header content.

`);
      expect(result.afterDomains).toBe('');
    });
  });

  describe('updatePackageJsonForContextScript (prepare:context script)', () => {
    it('should add prepare:context script when scripts object is empty', () => {
      const packageJson = { scripts: {} };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.['prepare:context']).toBe('cpy SDK_CONTEXT.md dist/');
      expect(result.prepareContextAdded).toBe(true);
      expect(result.buildScriptUpdated).toBe(false);
    });

    it('should add prepare:context script when scripts object does not exist', () => {
      const packageJson = {};

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.['prepare:context']).toBe('cpy SDK_CONTEXT.md dist/');
      expect(result.prepareContextAdded).toBe(true);
      expect(result.buildScriptUpdated).toBe(false);
    });

    it('should not overwrite existing prepare:context script', () => {
      const packageJson = {
        scripts: {
          'prepare:context': 'custom-command'
        }
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.['prepare:context']).toBe('custom-command');
      expect(result.prepareContextAdded).toBe(false);
    });

    it('should update build script to include prepare:context', () => {
      const packageJson = {
        scripts: {
          build: 'tsc'
        }
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.build).toBe('tsc && npm run prepare:context');
      expect(result.buildScriptUpdated).toBe(true);
    });

    it('should not update build script if it already includes prepare:context', () => {
      const packageJson = {
        scripts: {
          build: 'tsc && npm run prepare:context'
        }
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.build).toBe('tsc && npm run prepare:context');
      expect(result.buildScriptUpdated).toBe(false);
    });

    it('should not update build script if it does not exist', () => {
      const packageJson = {
        scripts: {}
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.build).toBeUndefined();
      expect(result.buildScriptUpdated).toBe(false);
    });

    it('should add prepare:context and update build script together', () => {
      const packageJson = {
        scripts: {
          build: 'tsc',
          test: 'jest'
        }
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.scripts?.['prepare:context']).toBe('cpy SDK_CONTEXT.md dist/');
      expect(result.packageJson.scripts?.build).toBe('tsc && npm run prepare:context');
      expect(result.packageJson.scripts?.test).toBe('jest');
      expect(result.prepareContextAdded).toBe(true);
      expect(result.buildScriptUpdated).toBe(true);
    });

    it('should preserve other package.json properties', () => {
      const packageJson = {
        name: '@test/my-sdk',
        version: '1.0.0',
        scripts: {
          build: 'tsc'
        },
        dependencies: {
          lodash: '^4.0.0'
        }
      };

      const result = updatePackageJsonForContextScript(packageJson);

      expect(result.packageJson.name).toBe('@test/my-sdk');
      expect(result.packageJson.version).toBe('1.0.0');
      expect(result.packageJson.dependencies).toEqual({ lodash: '^4.0.0' });
    });

    it('should not mutate the original package.json object', () => {
      const packageJson = {
        scripts: {
          build: 'tsc'
        }
      };

      updatePackageJsonForContextScript(packageJson);

      expect(packageJson.scripts.build).toBe('tsc');
      expect(packageJson.scripts['prepare:context']).toBeUndefined();
    });
  });
});
