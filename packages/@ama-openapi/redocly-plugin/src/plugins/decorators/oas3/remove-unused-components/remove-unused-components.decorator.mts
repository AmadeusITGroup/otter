import {
  logger,
  type Oas3Preprocessor,
  type UserContext,
} from '@redocly/openapi-core';

/** Name of the removeUnusedComponents custom decorator */
export const DECORATOR_ID_REMOVE_UNUSED_COMPONENTS = 'remove-unused-components';

/** Composition keywords in OpenAPI Schema */
const COMPOSITION_KEYWORDS = ['allOf', 'oneOf', 'anyOf', 'not'] as const;

/**
 * This decorator remove the components not referred in the bundled specification
 *
 * Note:
 * The purpose of this plugin is to support inter dependencies not supported currently by the Redocly built-in `remove-unused-components`.
 * This plugin will be deprecated in favor to the built-in plugin when issue https://github.com/Redocly/redocly-cli/issues/1783 is fixed
 */
export const removeUnusedComponentsDecorator: Oas3Preprocessor = () => {
  const discriminatorNoMappingRefs = new Set<UserContext>();
  const refMaps = new Map<string, string[]>();

  const setRef = (ref: string, ctx: UserContext) => {
    if (refMaps.has(ref)) {
      const refs = refMaps.get(ref)!;
      if (!refs.includes(ctx.location.absolutePointer)) {
        return refMaps.set(ref, [...refs, ctx.location.absolutePointer]);
      }
    } else {
      return refMaps.set(ref, [ctx.location.absolutePointer]);
    }
  };

  const registerComponent = (node: any, ctx: UserContext) => {
    const rec = (obj: any) => {
      if (obj && typeof obj === 'object' && obj.$ref && !ctx.location.absolutePointer.endsWith(obj.$ref)) {
        setRef(obj.$ref, ctx);
      }
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item) => rec(item));
        } else if (obj) {
          Object.values(obj).forEach((value) => rec(value));
        }
      }
    };
    rec(node);
  };

  return {
    Discriminator: {
      leave: (node, ctx) => {
        Object.values(node.mapping ?? {})
          .forEach((value) => setRef(value, ctx));
      }
    },

    // Discover and register if the schema references are used as implicit polymorphism
    Schema: {
      skip: (node) => node.type !== 'object',
      enter: (node, ctx) => {
        if (node.discriminator) {
          if (node.discriminator.mapping) {
            Object.values(node.discriminator.mapping)
              .forEach((value) => setRef(value, ctx));
          } else {
            discriminatorNoMappingRefs.add(ctx);
          }
        }
      },
      leave: (node, ctx) => {
        const discriminatorRefs = [...discriminatorNoMappingRefs];
        COMPOSITION_KEYWORDS
          .map((key) => node[key])
          .filter((item) => !!item)
          .forEach((item) => {
            const schemas = Array.isArray(item) ? item : [item];
            schemas.forEach((schema) => {
              const schemaRef = schema.$ref;
              if (schemaRef) {
                const discriminatorRef = discriminatorRefs.find(({ location }) => location.absolutePointer.endsWith(schemaRef));
                if (discriminatorRef) {
                  setRef(ctx.location.pointer, discriminatorRef);
                }
              }
            });
          });
      }
    },

    Paths: {
      leave: registerComponent
    },
    NamedSchemas: {
      Schema: registerComponent
    },
    NamedParameters: {
      Parameter: registerComponent
    },
    NamedResponses: {
      Response: registerComponent
    },
    NamedExamples: {
      Example: registerComponent
    },
    NamedRequestBodies: {
      RequestBody: registerComponent
    },
    NamedHeaders: {
      Header: registerComponent
    },

    Components: {
      leave: (node, ctx) => {
        const removeUnusedSchemas = (): number => {
          if (!node.schemas) {
            return 0;
          }

          const toRemoveSchemaNames = Object.keys(node.schemas)
            .filter((name) => !refMaps.has(`#/components/schemas/${name}`));

          toRemoveSchemaNames
            .forEach((name) => {
              delete node.schemas![name];
              const elementRef = `${ctx.location.absolutePointer}/schemas/${name}`;
              refMaps.forEach((locations, ref) => {
                if (locations.includes(elementRef)) {
                  locations = locations.filter((location) => location !== elementRef);
                  if (locations.length === 0) {
                    refMaps.delete(ref);
                  } else {
                    refMaps.set(ref, locations);
                  }
                }
              });
            });
          return toRemoveSchemaNames.length > 0 ? toRemoveSchemaNames.length + removeUnusedSchemas() : 0;
        };

        const removedCount = removeUnusedSchemas();

        if (node.schemas && Object.keys(node.schemas).length === 0) {
          delete node.schemas;
        }

        if (removedCount > 0) {
          logger.info(`Removed ${removedCount} unused components`);
        }
      }
    },
    Root: {
      leave: (root) => {
        if (root.components && Object.keys(root.components).length === 0) {
          delete root.components;
        }
      }
    }
  };
};
