import { applyMask } from './apply-mask.mjs';

describe('applyMask', () => {
  const testUrl = 'https://example.com/api/spec.json';

  it('should add mask metadata properties to model', () => {
    const model = { type: 'object', properties: { name: { type: 'string' } } };
    const result = applyMask(model, testUrl);

    expect(result['x-internal-masked']).toBe(false);
    expect(result['x-internal-source']).toBe(testUrl);
  });

  it('should return model with metadata when no mask is provided', () => {
    const model = { type: 'object', properties: { name: { type: 'string' }, age: { type: 'number' } } };
    const result = applyMask(model, testUrl, undefined);

    expect(result).toEqual({
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'number' } },
      'x-internal-masked': false,
      'x-internal-source': testUrl
    });
  });

  it('should set masked flag to true when mask is provided', () => {
    const model = { type: 'object', properties: { name: { type: 'string' } } };
    const mask = { properties: { name: true } };
    const result = applyMask(model, testUrl, mask);

    expect(result['x-internal-masked']).toBe(true);
  });

  describe('property masking', () => {
    it('should filter properties based on mask', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const mask = {
        properties: {
          name: true,
          email: true
        }
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.properties).toEqual({
        name: { type: 'string' },
        email: { type: 'string' }
      });
      expect(result.properties.age).toBeUndefined();
    });

    it('should exclude properties when mask value is false', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      };
      const mask = {
        properties: {
          name: true,
          email: false
        }
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.properties).toEqual({
        name: { type: 'string' }
      });
    });

    it('should handle nested property masks', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' }
        }
      };
      const mask = {
        properties: {
          name: true,
          email: true
        }
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.properties).toEqual({
        name: { type: 'string' },
        email: { type: 'string' }
      });
      expect(result.properties.address).toBeUndefined();
    });

    it('should handle null or undefined mask properties gracefully', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const mask = {
        properties: null as any
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.properties).toEqual({ name: { type: 'string' } });
    });

    it('should keep all properties when mask properties is not defined', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const mask = {};
      const result = applyMask(model, testUrl, mask);

      expect(result.properties).toEqual({
        name: { type: 'string' },
        age: { type: 'number' }
      });
    });
  });

  describe('additional mask properties', () => {
    it('should apply additional mask properties and remove type/properties', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const mask = {
        customField: 'customValue',
        anotherField: 123
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.type).toBeUndefined();
      expect(result.properties).toBeUndefined();
      expect(result.customField).toBe('customValue');
      expect(result.anotherField).toBe(123);
    });

    it('should handle object type additional properties', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const mask = {
        customObject: {
          key1: 'value1',
          key2: 'value2'
        }
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.customObject).toBeDefined();
    });

    it('should handle array type additional properties', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const mask = {
        customArray: ['item1', 'item2']
      };
      const result = applyMask(model, testUrl, mask);

      expect(Array.isArray(result.customArray)).toBe(true);
    });

    it('should not delete type and properties when only properties mask is provided', () => {
      const model = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const mask = {
        properties: {
          name: true
        }
      };
      const result = applyMask(model, testUrl, mask);

      expect(result.type).toBe('object');
      expect(result.properties).toEqual({
        name: { type: 'string' }
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty model', () => {
      const model = {};
      const mask = { properties: { name: true } };
      const result = applyMask(model, testUrl, mask);

      expect(result['x-internal-masked']).toBe(true);
      expect(result['x-internal-source']).toBe(testUrl);
    });

    it('should handle model without properties', () => {
      const model = { type: 'string' };
      const mask = { properties: { name: true } };
      const result = applyMask(model, testUrl, mask);

      expect(result.type).toBe('string');
    });
  });
});
