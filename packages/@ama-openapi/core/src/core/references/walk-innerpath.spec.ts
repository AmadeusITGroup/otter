import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  SpecificationFile,
} from '../transforms/transform.mjs';
import {
  walkInnerPath,
} from './walk-innerpath.mjs';

describe('walkInnerPath', () => {
  it('should return the entire specification when innerPath is undefined', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: { type: 'object' }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: undefined
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual(specification);
  });

  it('should return the entire specification when innerPath is empty string', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: { type: 'object' }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: ''
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual(specification);
  });

  it('should walk a single level path', () => {
    const specification: SpecificationFile = {
      components: { type: 'object' },
      paths: { type: 'paths' }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({ type: 'object' });
  });

  it('should walk a multi-level path', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            }
          }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components/schemas/User'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    });
  });

  it('should handle paths with leading slash', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: { type: 'object' }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: '/components/schemas/User'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({ type: 'object' });
  });

  it('should handle paths with trailing slash', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: { type: 'object' }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components/schemas/User/'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({ type: 'object' });
  });

  it('should handle paths with multiple consecutive slashes', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {
          User: { type: 'object' }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components//schemas///User'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({ type: 'object' });
  });

  it('should return undefined when path does not exist', () => {
    const specification: SpecificationFile = {
      components: {
        schemas: {}
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components/schemas/NonExistent'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toBeUndefined();
  });

  it('should return undefined when intermediate path does not exist', () => {
    const specification: SpecificationFile = {
      components: {}
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'components/schemas/User'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toBeUndefined();
  });

  it('should handle nested objects with various data types', () => {
    const specification: SpecificationFile = {
      data: {
        config: {
          settings: {
            enabled: true,
            count: 42,
            tags: ['tag1', 'tag2']
          }
        }
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'data/config/settings'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual({
      enabled: true,
      count: 42,
      tags: ['tag1', 'tag2']
    });
  });

  it('should handle paths to primitive values', () => {
    const specification: SpecificationFile = {
      version: {
        number: '1.0.0'
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'version/number'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toBe('1.0.0');
  });

  it('should handle paths to arrays', () => {
    const specification: SpecificationFile = {
      items: {
        list: [1, 2, 3]
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'items/list'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle paths with numeric indices', () => {
    const specification: SpecificationFile = {
      items: {
        list: ['first', 'second', 'third']
      }
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'items/list/1'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toBe('second');
  });

  it('should return undefined when accessing property on null', () => {
    const specification: SpecificationFile = {
      data: null
    };
    const retrievedModel: Pick<RetrievedDependencyModel, 'model'> = {
      model: {
        innerPath: 'data/field'
      } as any
    };

    const result = walkInnerPath(specification, retrievedModel);
    expect(result).toBeUndefined();
  });
});
