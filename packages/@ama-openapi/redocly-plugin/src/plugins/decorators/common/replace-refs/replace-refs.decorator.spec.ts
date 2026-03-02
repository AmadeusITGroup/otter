import {
  DECORATOR_ID_REDIRECT_REF,
  redirectRefsDecorator,
} from './replace-refs.decorator.mjs';
import type {
  RedirectRefDecoratorOptions,
} from './replace-refs.decorator.mjs';

describe('redirectRefsDecorator', () => {
  describe('DECORATOR_ID_REDIRECT_REF', () => {
    it('should have the correct decorator ID', () => {
      expect(DECORATOR_ID_REDIRECT_REF).toBe('redirect-ref');
    });
  });

  describe('decorator initialization', () => {
    it('should create a decorator with ref visitor methods', () => {
      const decorator = redirectRefsDecorator({});
      expect(decorator).toBeDefined();
      expect(decorator.ref).toBeDefined();
      expect(decorator.ref.enter).toBeDefined();
      expect(decorator.ref.leave).toBeDefined();
    });

    it('should handle empty options', () => {
      const decorator = redirectRefsDecorator({});
      expect(decorator).toBeDefined();
    });

    it('should handle undefined rules', () => {
      const decorator = redirectRefsDecorator({ rules: undefined });
      expect(decorator).toBeDefined();
    });

    it('should handle empty rules array', () => {
      const decorator = redirectRefsDecorator({ rules: [] });
      expect(decorator).toBeDefined();
    });
  });

  describe('ref.leave', () => {
    it('should redirect ref when rule is matched', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/'
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'my-models/User' };
      const parent = { node };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/');
    });

    it('should keep final inner path when keepFinalInnerPath is true', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/my-models/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const nodeEnter = { $ref: 'my-models/User' };
      const node = { $ref: '#/User' };
      const parent = { node };

      decorator.ref.enter(nodeEnter, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/my-models/#/User');
    });

    it('should not redirect ref when no rule is matched', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/'
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'other-models/User' };
      const parent = { node };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('other-models/User');
    });

    it('should handle multiple nodes in parent with same ref', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/my-models/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const enterNode = { $ref: 'my-models/user' };
      const node = { $ref: '#/User' };
      const parent = {
        ...enterNode,
        anotherNode: { $ref: 'Product' },
        'x-custom': 'value'
      };

      decorator.ref.enter(enterNode, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/my-models/#/User');
    });

    it('should use the first rule when multiple rules match different nodes', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [
          {
            includeRefPatterns: 'models-v2/.*',
            redirectUrl: 'https://example.com/models-v1/'
          },
          {
            includeRefPatterns: 'models-v2/.*',
            redirectUrl: 'https://example2.com/models-v2/',
            keepFinalInnerPath: true
          }
        ]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: '#/models-v2/User' };
      const parent = {
        node
      };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/models-v1/');
    });

    it('should handle undefined redirect index gracefully', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/'
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'other-models/User' };
      const parent = {
        node
      };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('other-models/User');
    });

    it('should handle -1 redirect index gracefully', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/'
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'other-models/User' };
      const parent = {
        node
      };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('other-models/User');
    });
  });

  describe('complex scenarios', () => {
    it('should handle refs with hash fragments', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/my-models/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'schema.json#/definitions/User' };
      const parent = { node };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('schema.json#/definitions/User');
    });

    it('should handle refs with special characters', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'my-models/.*',
          redirectUrl: 'https://example.com/my-models/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const enterNode = { $ref: 'my-models/User-Model_v2' };
      const node = { $ref: 'User-Model_v2.json' };
      const parent = { node };

      decorator.ref.enter(enterNode, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/my-models/User-Model_v2.json');
    });

    it('should work with tag-based rules', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          hasTag: 'x-external-api',
          redirectUrl: 'https://external-api.com/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: '#/User' };
      const parent = {
        ex: {
          ...node,
          'x-external-api': true
        }
      };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://external-api.com/#/User');
    });

    it('should handle complex parent objects with nested structures', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          hasTag: 'x-redirect',
          redirectUrl: 'https://example.com/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'User' };
      const parent = {
        node: {
          ...node,
          nested: {
            deep: {
              'x-redirect': true
            }
          },
          'x-redirect': 'to be considered'
        }
      };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('https://example.com/User');
    });

    it('should handle multiple sequential ref operations', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: [{
          includeRefPatterns: 'models/.*',
          redirectUrl: 'https://api.example.com/v1/',
          keepFinalInnerPath: true
        }]
      };
      const decorator = redirectRefsDecorator(options);

      const node1 = { $ref: 'models/User' };
      const parent1 = { node: node1 };
      decorator.ref.enter(node1, { parent: parent1, location: { absolutePointer: '#/paths/~1users/get/responses/200' } } as any);
      decorator.ref.leave(node1, { location: { absolutePointer: '#/paths/~1users/get/responses/200' } } as any);

      const node2 = { $ref: 'models/Product' };
      const parent2 = { node: node2 };
      decorator.ref.enter(node2, { parent: parent2, location: { absolutePointer: '#/paths/~1products/get/responses/200' } } as any);
      decorator.ref.leave(node2, { location: { absolutePointer: '#/paths/~1products/get/responses/200' } } as any);

      expect(node1.$ref).toBe('https://api.example.com/v1/models/User');
      expect(node2.$ref).toBe('https://api.example.com/v1/models/Product');
    });

    it('should handle refs without redirection when rules array is empty', () => {
      const options: RedirectRefDecoratorOptions = {
        rules: []
      };
      const decorator = redirectRefsDecorator(options);
      const node = { $ref: 'models/User' };
      const parent = { node };

      decorator.ref.enter(node, { parent, location: { absolutePointer: '#/test' } } as any);
      decorator.ref.leave(node, { location: { absolutePointer: '#/test' } } as any);

      expect(node.$ref).toBe('models/User');
    });
  });
});
