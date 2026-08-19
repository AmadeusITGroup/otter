import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  DECORATOR_ID_ENFORCE_DISCRIMINATOR_MANDATORY,
  enforceDiscriminatorMandatoryDecorator,
} from './enforce-discriminator-mandatory.decorator.mjs';

describe('enforceDiscriminatorMandatoryDecorator', () => {
  describe('DECORATOR_ID_ENFORCE_DISCRIMINATOR_MANDATORY', () => {
    it('should have the correct decorator ID', () => {
      expect(DECORATOR_ID_ENFORCE_DISCRIMINATOR_MANDATORY).toBe('enforce-discriminator-mandatory');
    });
  });

  describe('decorator initialization', () => {
    it('should create a decorator with Schema visitor methods', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      expect(decorator).toBeDefined();
      expect(decorator.Schema).toBeDefined();
      expect((decorator.Schema as any).leave).toBeDefined();
    });
  });

  describe('OAS 3.0/3.1 discriminator format', () => {
    it('should add discriminator property to required array when not present', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: 'petType'
        },
        properties: {
          petType: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('petType');
    });

    it('should not duplicate discriminator property if already in required', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node = {
        type: 'object',
        discriminator: {
          propertyName: 'petType'
        },
        properties: {
          petType: { type: 'string' }
        },
        required: ['petType', 'name']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toEqual(['petType', 'name']);
      expect(node.required.filter((prop: string) => prop === 'petType')).toHaveLength(1);
    });

    it('should create required array if it does not exist', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: 'status'
        },
        properties: {
          status: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toEqual(['status']);
    });

    it('should preserve existing required properties', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node = {
        type: 'object',
        discriminator: {
          propertyName: 'type'
        },
        properties: {
          type: { type: 'string' },
          id: { type: 'string' },
          name: { type: 'string' }
        },
        required: ['id', 'name']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toContain('id');
      expect(node.required).toContain('name');
      expect(node.required).toContain('type');
      expect(node.required).toHaveLength(3);
    });

    it('should handle discriminator with mapping', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: 'objectType',
          mapping: {
            dog: '#/components/schemas/Dog',
            cat: '#/components/schemas/Cat'
          }
        },
        properties: {
          objectType: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('objectType');
    });
  });

  describe('OAS 2.0 discriminator format', () => {
    it('should add discriminator string to required array', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: 'petType',
        properties: {
          petType: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('petType');
    });

    it('should not duplicate discriminator string if already in required', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: 'petType',
        properties: {
          petType: { type: 'string' }
        },
        required: ['petType', 'name']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toEqual(['petType', 'name']);
      expect(node.required.filter((prop: string) => prop === 'petType')).toHaveLength(1);
    });

    it('should create required array for OAS 2.0 style discriminator', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: 'animalType',
        properties: {
          animalType: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toEqual(['animalType']);
    });
  });

  describe('edge cases', () => {
    it('should handle schema without discriminator', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toEqual(['name']);
    });

    it('should handle empty discriminator object', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {},
        properties: {
          type: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeUndefined();
    });

    it('should handle discriminator with empty propertyName', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: ''
        },
        properties: {
          type: { type: 'string' }
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeUndefined();
    });

    it('should handle schema with no properties', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: 'type'
        }
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('type');
    });

    it('should handle schema with allOf composition', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        discriminator: {
          propertyName: 'petType',
          mapping: {
            dog: 'Dog',
            cat: 'Cat'
          }
        },
        allOf: [
          { $ref: '#/components/schemas/Pet' }
        ]
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('petType');
    });

    it('should handle schema with oneOf composition', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        discriminator: {
          propertyName: 'type'
        },
        oneOf: [
          { $ref: '#/components/schemas/TypeA' },
          { $ref: '#/components/schemas/TypeB' }
        ]
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toBeDefined();
      expect(node.required).toContain('type');
    });

    it('should handle complex schema with existing required and discriminator', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: {
          propertyName: 'kind',
          mapping: {
            a: '#/components/schemas/A',
            b: '#/components/schemas/B',
            c: '#/components/schemas/C'
          }
        },
        properties: {
          kind: { type: 'string' },
          id: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'timestamp']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toHaveLength(3);
      expect(node.required).toContain('id');
      expect(node.required).toContain('timestamp');
      expect(node.required).toContain('kind');
    });

    it('should handle null discriminator', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: null,
        properties: {
          type: { type: 'string' }
        },
        required: ['type']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toEqual(['type']);
    });

    it('should handle undefined discriminator', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});
      const node: any = {
        type: 'object',
        discriminator: undefined,
        properties: {
          type: { type: 'string' }
        },
        required: ['type']
      };

      (decorator.Schema as any).leave(node);

      expect(node.required).toEqual(['type']);
    });
  });

  describe('multiple schemas processing', () => {
    it('should handle multiple schemas independently', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});

      const schema1: any = {
        type: 'object',
        discriminator: { propertyName: 'type1' },
        properties: { type1: { type: 'string' } }
      };

      const schema2: any = {
        type: 'object',
        discriminator: { propertyName: 'type2' },
        properties: { type2: { type: 'string' } }
      };

      (decorator.Schema as any).leave(schema1);
      (decorator.Schema as any).leave(schema2);

      expect(schema1.required).toEqual(['type1']);
      expect(schema2.required).toEqual(['type2']);
    });

    it('should not affect schemas without discriminators', () => {
      const decorator = enforceDiscriminatorMandatoryDecorator({});

      const schemaWithDiscriminator: any = {
        type: 'object',
        discriminator: { propertyName: 'type' },
        properties: { type: { type: 'string' } }
      };

      const schemaWithoutDiscriminator: any = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name']
      };

      (decorator.Schema as any).leave(schemaWithDiscriminator);
      (decorator.Schema as any).leave(schemaWithoutDiscriminator);

      expect(schemaWithDiscriminator.required).toEqual(['type']);
      expect(schemaWithoutDiscriminator.required).toEqual(['name']);
    });
  });
});
