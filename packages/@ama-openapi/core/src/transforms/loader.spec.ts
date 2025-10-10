import { deserialize, serialize } from './loader.mjs';

describe('loader', () => {
  describe('deserialize', () => {
    it('should deserialize valid JSON content', () => {
      const jsonContent = JSON.stringify({
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      });

      const result = deserialize(jsonContent);

      expect(result.format).toBe('json');
      expect(result.obj).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      });
    });

    it('should deserialize valid YAML content', () => {
      const yamlContent = `
type: object
properties:
  name:
    type: string
  age:
    type: number
`;

      const result = deserialize(yamlContent);

      expect(result.format).toBe('yaml');
      expect(result.obj).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      });
    });

    it('should parse complex JSON structures', () => {
      const jsonContent = JSON.stringify({
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success'
                }
              }
            }
          }
        }
      });

      const result = deserialize(jsonContent);

      expect(result.format).toBe('json');
      expect(result.obj.openapi).toBe('3.0.0');
      expect(result.obj.paths['/users'].get.responses['200'].description).toBe('Success');
    });

    it('should parse complex YAML structures', () => {
      const yamlContent = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: Success
`;

      const result = deserialize(yamlContent);

      expect(result.format).toBe('yaml');
      expect(result.obj.openapi).toBe('3.0.0');
      expect(result.obj.paths['/users'].get.responses['200'].description).toBe('Success');
    });

    it('should handle empty JSON object', () => {
      const jsonContent = '{}';

      const result = deserialize(jsonContent);

      expect(result.format).toBe('json');
      expect(result.obj).toEqual({});
    });

    it('should handle empty YAML content', () => {
      const yamlContent = '';

      const result = deserialize(yamlContent);

      expect(result.format).toBe('yaml');
    });

    it('should fallback to YAML for invalid JSON', () => {
      const invalidJsonContent = 'not a valid json';

      const result = deserialize(invalidJsonContent);

      expect(result.format).toBe('yaml');
      expect(result.obj).toBe('not a valid json');
    });

    it('should handle JSON with arrays', () => {
      const jsonContent = JSON.stringify({
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      });

      const result = deserialize(jsonContent);

      expect(result.format).toBe('json');
      expect(result.obj.items).toHaveLength(2);
      expect(result.obj.items[0].name).toBe('Item 1');
    });

    it('should handle YAML with arrays', () => {
      const yamlContent = `
items:
  - id: 1
    name: Item 1
  - id: 2
    name: Item 2
`;

      const result = deserialize(yamlContent);

      expect(result.format).toBe('yaml');
      expect(result.obj.items).toHaveLength(2);
      expect(result.obj.items[1].name).toBe('Item 2');
    });
  });

  describe('serialize', () => {
    it('should serialize to JSON format', () => {
      const obj = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };

      const result = serialize('json', obj);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(obj);
    });

    it('should serialize to YAML format', () => {
      const obj = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };

      const result = serialize('yaml', obj);

      expect(result).toContain('type: object');
      expect(result).toContain('properties:');
      expect(result).toContain('name:');
    });

    it('should format JSON with proper indentation', () => {
      const obj = {
        level1: {
          level2: {
            value: 'test'
          }
        }
      };

      const result = serialize('json', obj);

      expect(result).toContain('  ');
      expect(result).toContain('\n');
      expect(JSON.parse(result)).toEqual(obj);
    });

    it('should handle complex objects in JSON', () => {
      const obj = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  description: 'Success'
                }
              }
            }
          }
        }
      };

      const result = serialize('json', obj);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(obj);
    });

    it('should handle arrays in JSON', () => {
      const obj = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };

      const result = serialize('json', obj);
      const parsed = JSON.parse(result);

      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].name).toBe('Item 1');
    });

    it('should handle arrays in YAML', () => {
      const obj = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };

      const result = serialize('yaml', obj);

      expect(result).toContain('items:');
      expect(result).toContain('- id: 1');
      expect(result).toContain('name: Item 1');
    });

    it('should handle empty objects', () => {
      const obj = {};

      const jsonResult = serialize('json', obj);
      expect(JSON.parse(jsonResult)).toEqual({});

      const yamlResult = serialize('yaml', obj);
      expect(yamlResult).toBe('{}\n');
    });

    it('should handle null values', () => {
      const obj = {
        value: null as any
      };

      const jsonResult = serialize('json', obj);
      expect(JSON.parse(jsonResult).value).toBeNull();

      const yamlResult = serialize('yaml', obj);
      expect(yamlResult).toContain('value: null');
    });

    it('should handle boolean values', () => {
      const obj = {
        enabled: true,
        disabled: false
      };

      const jsonResult = serialize('json', obj);
      const parsed = JSON.parse(jsonResult);
      expect(parsed.enabled).toBe(true);
      expect(parsed.disabled).toBe(false);

      const yamlResult = serialize('yaml', obj);
      expect(yamlResult).toContain('enabled: true');
      expect(yamlResult).toContain('disabled: false');
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity in JSON round-trip', () => {
      const original = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: true
        }
      };

      const serialized = serialize('json', original);
      const { obj: deserialized } = deserialize(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should maintain data integrity in YAML round-trip', () => {
      const original = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const serialized = serialize('yaml', original);
      const { obj: deserialized } = deserialize(serialized);

      expect(deserialized).toEqual(original);
    });
  });
});
