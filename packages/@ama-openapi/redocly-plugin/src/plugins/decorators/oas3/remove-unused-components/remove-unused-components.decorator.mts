import {
  logger,
  type Oas3Preprocessor,
  type UserContext,
} from '@redocly/openapi-core';

/** Name of the removeUnusedComponents custom decorator */
export const DECORATOR_ID_REMOVE_UNUSED_COMPONENT = 'remove-unused-component';

/**
 * This decorator remove the components not referred in the bundled specification
 *
 * Note:
 * The purpose of this plugin is to support inter dependencies not supported currently by the Redocly built-in `remove-unused-components`.
 * This plugin will be deprecated in favor to the built-in plugin when issue https://github.com/Redocly/redocly-cli/issues/1783 is fixed
 */
export const removeUnusedComponentsDecorator: Oas3Preprocessor = () => {
  const refMaps = new Map<string, string[]>();

  const registerComponent = (node: any, ctx: UserContext) => {
    const rec = (obj: any) => {
      if (obj && typeof obj === 'object' && obj.$ref && !ctx.location.absolutePointer.endsWith(obj.$ref)) {
        if (refMaps.has(obj.$ref)) {
          const refs = refMaps.get(obj.$ref)!;
          if (!refs.includes(ctx.location.absolutePointer)) {
            return refMaps.set(obj.$ref, [...refs, ctx.location.absolutePointer]);
          }
        } else {
          return refMaps.set(obj.$ref, [ctx.location.absolutePointer]);
        }
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
