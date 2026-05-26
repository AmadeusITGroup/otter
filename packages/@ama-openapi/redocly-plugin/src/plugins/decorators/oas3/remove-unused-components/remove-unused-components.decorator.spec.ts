import type {
  UserContext,
} from '@redocly/openapi-core';
import {
  DECORATOR_ID_REMOVE_UNUSED_COMPONENTS,
  removeUnusedComponentsDecorator,
} from './remove-unused-components.decorator.mjs';

jest.mock('@redocly/openapi-core', () => {
  return {
    logger: {
      info: jest.fn()
    }
  };
});

describe('removeUnusedComponentsDecorator', () => {
  describe('DECORATOR_ID_REMOVE_UNUSED_COMPONENTS', () => {
    it('should have the correct decorator ID', () => {
      expect(DECORATOR_ID_REMOVE_UNUSED_COMPONENTS).toBe('remove-unused-components');
    });
  });

  describe('decorator initialization', () => {
    it('should create a decorator with required visitor methods', () => {
      const decorator = removeUnusedComponentsDecorator();
      expect(decorator).toBeDefined();
      expect(decorator.Paths).toBeDefined();
      expect(decorator.NamedSchemas).toBeDefined();
      expect(decorator.NamedParameters).toBeDefined();
      expect(decorator.NamedResponses).toBeDefined();
      expect(decorator.NamedExamples).toBeDefined();
      expect(decorator.NamedRequestBodies).toBeDefined();
      expect(decorator.NamedHeaders).toBeDefined();
      expect(decorator.Components).toBeDefined();
      expect(decorator.Root).toBeDefined();
    });
  });

  describe('registerComponent (via Paths.leave)', () => {
    it('should register refs from paths', () => {
      const decorator = removeUnusedComponentsDecorator();
      const node = {
        '/users': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(node, ctx);

      // Now check if the component is considered used
      const components = {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } },
          UnusedSchema: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas).toBeDefined();
      expect(components.schemas.User).toBeDefined();
      expect(components.schemas.UnusedSchema).toBeUndefined();
    });

    it('should handle nested refs in arrays', () => {
      const decorator = removeUnusedComponentsDecorator();
      const node = {
        '/users': {
          get: {
            parameters: [
              { $ref: '#/components/parameters/PageParam' },
              { $ref: '#/components/parameters/LimitParam' }
            ]
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(node, ctx);

      // Component cleanup should not remove referenced parameters
      const components = {
        schemas: {
          UnusedSchema: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas).toBeUndefined();
    });

    it('should handle deeply nested objects with refs', () => {
      const decorator = removeUnusedComponentsDecorator({});
      const node = {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Base' },
                      { $ref: '#/components/schemas/Extended' }
                    ]
                  }
                }
              }
            }
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(node, ctx);

      const components = {
        schemas: {
          Base: { type: 'object' },
          Extended: { type: 'object' },
          Unused: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.Base).toBeDefined();
      expect(components.schemas.Extended).toBeDefined();
      expect(components.schemas.Unused).toBeUndefined();
    });

    it('should not register self-referencing refs', () => {
      const decorator = removeUnusedComponentsDecorator({});
      const node = {
        type: 'object',
        properties: {
          self: { $ref: '#/components/schemas/RecursiveSchema' }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/components/schemas/RecursiveSchema' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(node, ctx);

      // Self-references should not be counted as external usage
      const components = {
        schemas: {
          RecursiveSchema: node
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      // RecursiveSchema is not referenced from paths, so it should be removed
      expect(components.schemas).toBeUndefined();
    });

    it('should not duplicate ref registrations', () => {
      const decorator = removeUnusedComponentsDecorator({});
      const node1 = {
        '/users': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      };
      const node2 = {
        '/posts': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      };

      const ctx1 = {
        location: { absolutePointer: '#/paths/users' }
      } as UserContext;
      const ctx2 = {
        location: { absolutePointer: '#/paths/users' }
      } as UserContext;

      decorator.Paths.leave!(node1, ctx1);
      decorator.Paths.leave!(node2, ctx2);

      const components = {
        schemas: {
          User: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.User).toBeDefined();
    });
  });

  describe('NamedSchemas.Schema', () => {
    it('should register refs from schema components', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Register schema with ref
      const schemaNode = {
        allOf: [{ $ref: '#/components/schemas/BaseModel' }]
      };
      const schemaCtx = {
        location: { absolutePointer: '#/components/schemas/ExtendedModel' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaNode, schemaCtx);

      // Register usage from paths
      const pathNode = {
        '/items': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ExtendedModel' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      // Test component cleanup
      const components = {
        schemas: {
          BaseModel: { type: 'object' },
          ExtendedModel: schemaNode,
          UnusedModel: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.BaseModel).toBeDefined();
      expect(components.schemas.ExtendedModel).toBeDefined();
      expect(components.schemas.UnusedModel).toBeUndefined();
    });
  });

  describe('Components.leave', () => {
    it('should remove unused schemas', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const pathNode = {
        '/users': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } },
          Product: { type: 'object', properties: { title: { type: 'string' } } },
          Category: { type: 'object', properties: { label: { type: 'string' } } }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.User).toBeDefined();
      expect(components.schemas.Product).toBeUndefined();
      expect(components.schemas.Category).toBeUndefined();
    });

    it('should handle inter-dependent schemas (cascading removal)', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Register schema B that references schema C
      const schemaB = {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/SchemaC' }
        }
      };
      const schemaBCtx = {
        location: { absolutePointer: '#/components/schemas/SchemaB' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaB, schemaBCtx);

      // Register path that only uses schema A
      const pathNode = {
        '/items': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaA' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          SchemaA: { type: 'object' },
          SchemaB: schemaB,
          SchemaC: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      // SchemaA is used from path
      expect(components.schemas.SchemaA).toBeDefined();
      // SchemaB is not used, should be removed along with its reference to SchemaC
      expect(components.schemas.SchemaB).toBeUndefined();
      expect(components.schemas.SchemaC).toBeUndefined();
    });

    it('should delete schemas property when all schemas are removed', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const components = {
        schemas: {
          UnusedA: { type: 'object' },
          UnusedB: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas).toBeUndefined();
    });

    it('should return early if no schemas exist', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const components = {
        parameters: {
          PageParam: { name: 'page', in: 'query', schema: { type: 'integer' } }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      expect(() => decorator.Components.leave!(components as any, componentsCtx)).not.toThrow();
      expect(components.parameters).toBeDefined();
    });

    it('should handle chain of dependent schemas', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Schema chain: SchemaA -> SchemaB -> SchemaC
      const schemaC = { type: 'object', properties: { value: { type: 'string' } } };
      const schemaCCtx = {
        location: { absolutePointer: '#/components/schemas/SchemaC' }
      } as UserContext;
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaC, schemaCCtx);

      const schemaB = {
        type: 'object',
        properties: {
          nested: { $ref: '#/components/schemas/SchemaC' }
        }
      };
      const schemaBCtx = {
        location: { absolutePointer: '#/components/schemas/SchemaB' }
      } as UserContext;
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaB, schemaBCtx);

      const schemaA = {
        type: 'object',
        properties: {
          data: { $ref: '#/components/schemas/SchemaB' }
        }
      };
      const schemaACtx = {
        location: { absolutePointer: '#/components/schemas/SchemaA' }
      } as UserContext;
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaA, schemaACtx);

      // Use SchemaA from path
      const pathNode = {
        '/items': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaA' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;
      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          SchemaA: schemaA,
          SchemaB: schemaB,
          SchemaC: schemaC,
          UnusedSchema: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      // All schemas in the chain should be kept
      expect(components.schemas.SchemaA).toBeDefined();
      expect(components.schemas.SchemaB).toBeDefined();
      expect(components.schemas.SchemaC).toBeDefined();
      expect(components.schemas.UnusedSchema).toBeUndefined();
    });
  });

  describe('Discriminator.leave', () => {
    it('should not remove schemas if they are used from paths', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const schemaA = { type: 'object', properties: { name: { type: 'string' } } };
      const schemaACtx = {
        location: { absolutePointer: '#/components/schemas/SchemaA' }
      } as UserContext;
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(schemaA, schemaACtx);

      // Use SchemaA from path
      const pathNode = {
        '/items': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaA' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;
      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          SchemaA: schemaA,
          UnusedSchema: { type: 'object' }
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      // SchemaA is used from path, so it should not be removed
      expect(components.schemas.SchemaA).toBeDefined();
      expect(components.schemas.UnusedSchema).toBeUndefined();
    });
  });

  describe('Root.leave', () => {
    it('should remove empty components object', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const root = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {}
      };

      decorator.Root.leave!(root as any);

      expect(root.components).toBeUndefined();
    });

    it('should keep components object if not empty', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const root = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: { type: 'object' }
          }
        }
      };

      decorator.Root.leave!(root as any);

      expect(root.components).toBeDefined();
      expect(root.components.schemas).toBeDefined();
    });

    it('should handle root without components', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const root = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {}
      };

      expect(() => decorator.Root.leave!(root as any)).not.toThrow();
      expect((root as any).components).toBeUndefined();
    });
  });

  describe('other component types', () => {
    it('should register parameter refs via NamedParameters.Parameter', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const parameterNode = {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' }
      };
      const ctx = {
        location: { absolutePointer: '#/components/parameters/IdParam' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      expect(() => decorator.NamedParameters.Parameter(parameterNode, ctx)).not.toThrow();
    });

    it('should register response refs via NamedResponses.Response', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const responseNode = {
        description: 'Success',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/components/responses/SuccessResponse' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      expect(() => decorator.NamedResponses.Response(responseNode, ctx)).not.toThrow();
    });

    it('should register example refs via NamedExamples.Example', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const exampleNode = {
        value: { name: 'John Doe' }
      };
      const ctx = {
        location: { absolutePointer: '#/components/examples/UserExample' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      expect(() => decorator.NamedExamples.Example(exampleNode, ctx)).not.toThrow();
    });

    it('should register request body refs via NamedRequestBodies.RequestBody', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const requestBodyNode = {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserRequest' }
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/components/requestBodies/CreateUser' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      expect(() => decorator.NamedRequestBodies.RequestBody(requestBodyNode, ctx)).not.toThrow();
    });

    it('should register header refs via NamedHeaders.Header', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const headerNode = {
        description: 'API Key',
        schema: { type: 'string' }
      };
      const ctx = {
        location: { absolutePointer: '#/components/headers/ApiKey' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      expect(() => decorator.NamedHeaders.Header(headerNode, ctx)).not.toThrow();
    });
  });

  describe('implicit discriminator (without mapping)', () => {
    it('should handle oneOf composition with discriminator without mapping', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Base schema with discriminator
      const animalSchema = {
        type: 'object' as const,
        discriminator: {
          propertyName: 'animalType'
        },
        properties: {
          animalType: { type: 'string' as const }
        }
      };
      const animalSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Animal' }
      } as UserContext;

      decorator.Schema.enter!(animalSchema, animalSchemaCtx);
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(animalSchema, animalSchemaCtx);

      // Derived schema using oneOf
      const petSchema = {
        oneOf: [
          { $ref: '#/components/schemas/Animal' }
        ]
      };
      const petSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Pet' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(petSchema, petSchemaCtx);
      decorator.Schema.leave!(petSchema, petSchemaCtx);

      // Use Pet from paths
      const pathNode = {
        '/pets': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Pet' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          Animal: animalSchema,
          Pet: petSchema
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.Animal).toBeDefined();
      expect(components.schemas.Pet).toBeDefined();
    });

    it('should handle anyOf composition with discriminator without mapping', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Base schema with discriminator
      const shapeSchema = {
        type: 'object' as const,
        discriminator: {
          propertyName: 'shapeType'
        }
      };
      const shapeSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Shape' }
      } as UserContext;

      decorator.Schema.enter!(shapeSchema, shapeSchemaCtx);
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(shapeSchema, shapeSchemaCtx);

      // Derived schema using anyOf
      const drawableSchema = {
        anyOf: [
          { $ref: '#/components/schemas/Shape' }
        ]
      };
      const drawableSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Drawable' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(drawableSchema, drawableSchemaCtx);
      decorator.Schema.leave!(drawableSchema, drawableSchemaCtx);

      // Use Drawable from paths
      const pathNode = {
        '/shapes': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Drawable' }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          Shape: shapeSchema,
          Drawable: drawableSchema
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      expect(components.schemas.Shape).toBeDefined();
      expect(components.schemas.Drawable).toBeDefined();
    });

    it('should not affect schemas with discriminator that has explicit mapping', () => {
      const decorator = removeUnusedComponentsDecorator({});

      // Base schema with discriminator AND mapping
      const vehicleSchema = {
        type: 'object' as const,
        discriminator: {
          propertyName: 'vehicleType',
          mapping: {
            car: '#/components/schemas/Car',
            truck: '#/components/schemas/Truck'
          }
        }
      };
      const vehicleSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Vehicle' }
      } as UserContext;

      decorator.Schema.enter!(vehicleSchema, vehicleSchemaCtx);
      decorator.Discriminator.leave!(vehicleSchema.discriminator, vehicleSchemaCtx);
      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(vehicleSchema, vehicleSchemaCtx);

      const carSchema = {
        allOf: [
          { $ref: '#/components/schemas/Vehicle' }
        ]
      };
      const carSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Car' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(carSchema, carSchemaCtx);

      const truckSchema = {
        allOf: [
          { $ref: '#/components/schemas/Vehicle' }
        ]
      };
      const truckSchemaCtx = {
        location: { absolutePointer: '#/components/schemas/Truck' }
      } as UserContext;

      // eslint-disable-next-line new-cap -- Part of the Redocly definition
      decorator.NamedSchemas.Schema(truckSchema, truckSchemaCtx);

      // Use Vehicle from paths
      const pathNode = {
        '/vehicles': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Vehicle' }
                  }
                }
              }
            }
          }
        }
      };
      const pathCtx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      decorator.Paths.leave!(pathNode, pathCtx);

      const components = {
        schemas: {
          Vehicle: vehicleSchema,
          Car: carSchema,
          Truck: truckSchema
        }
      };
      const componentsCtx = {
        location: { absolutePointer: '#/components' }
      } as UserContext;

      decorator.Components.leave!(components, componentsCtx);

      // With explicit mapping, all mapped schemas should be kept
      expect(components.schemas.Vehicle).toBeDefined();
      expect(components.schemas.Car).toBeDefined();
      expect(components.schemas.Truck).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null values in objects', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const node = {
        '/users': {
          get: {
            responses: {
              200: {
                content: null as any,
                description: 'Success'
              }
            }
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      expect(() => decorator.Paths.leave!(node as any, ctx)).not.toThrow();
    });

    it('should handle empty objects', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const node = {};
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      expect(() => decorator.Paths.leave!(node, ctx)).not.toThrow();
    });

    it('should handle primitive values in objects', () => {
      const decorator = removeUnusedComponentsDecorator({});

      const node = {
        '/users': {
          get: {
            summary: 'Get users',
            deprecated: false,
            operationId: 'getUsers'
          }
        }
      };
      const ctx = {
        location: { absolutePointer: '#/paths' }
      } as UserContext;

      expect(() => decorator.Paths.leave!(node, ctx)).not.toThrow();
    });
  });
});
