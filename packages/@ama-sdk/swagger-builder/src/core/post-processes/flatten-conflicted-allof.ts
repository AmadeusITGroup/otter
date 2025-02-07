import {
  X_VENDOR_CONFLICT_TAG,
} from '../utils';
import {
  PostProcess,
} from './post-process.interface';

/**
 * Flatten conflicted AllOf post process
 * The purpose is to apply the composition to the definitions depending of a _ started definition
 * @example Override MyCustomDefinition from `@example-spec/api` to add the "example" field
 * ```yaml
 * definitions:
 *  MyCustomDefinition:
 *    allOf:
 *      - $ref: '@example-spec/api#/definitions/MyCustomDefinition'
 *      - type: object
 *        required: ["example"]
 *        properties:
 *          example:
 *            type: string
 *```
 * @example without the `FlattenConflictedAllOf` postProcess
 * ```yaml
 * definitions:
 *  _ExamppleSpecApiMyCustomDefinition:
 *    x-generated-from-conflict: true
 *    required: ["originalField"]
 *    properties:
 *      originalField:
 *        type: string
 *
 *  MyCustomDefinition:
 *    allOf:
 *      - $ref: '#/definitions/_ExamppleSpecApiMyCustomDefinition'
 *      - type: object
 *        required: ["example"]
 *        properties:
 *          example:
 *            type: string
 *```
 * @example With the `FlattenConflictedAllOf` postProcess
 * ```yaml
 * definitions:
 *  MyCustomDefinition:
 *    required: ["originalField", "example"]
 *    properties:
 *      originalField:
 *        type: string
 *      example:
 *        type: string
 * ```
 */
export class FlattenConflictedAllOf implements PostProcess {
  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    /** List of Definitions to merge end referred in a allOf  */
    const toFlattenDefinitions = Object.entries<any>(swaggerSpec.definitions)
      .filter(([,definition]) => !!definition[X_VENDOR_CONFLICT_TAG])
      .reduce((acc, [definitionName, definition]) => {
        acc[definitionName] = definition;
        return acc;
      }, {} as Record<string, any>);

    Object.values<any>(swaggerSpec.definitions)
      .filter((definition) => !definition[X_VENDOR_CONFLICT_TAG] && definition.allOf)
      .forEach((definition: { allOf?: any[]; properties?: Record<string, any>; type: any; description?: string; required: string[] }) => {
        // If not an allOf or if the allOf it not based on conflicting definition, we skip the process
        if (!(definition.allOf && definition.allOf.some((def) => def.$ref && (def.$ref as string).split('/').at(-1)! in Object.keys(toFlattenDefinitions)))) {
          return;
        }

        // Simple case: extension of an existing definition (so an allOf with a ref to a conflicted def and an object definition to extend it)
        if (definition.allOf.length === 2 && !definition.allOf[1].$ref) {
          /** Definition to merge with the object  */
          const [, definitionToMerge] = Object.entries(toFlattenDefinitions).find(([defName]) => definition.allOf!.some((item) => item.$ref && (item.$ref as string).endsWith(defName)))!;
          /** Reference to the definition to update with the conflicted original definition */
          const toUpdateDefinition = Object.values<any>(definition.allOf).find((def) => !def.$ref);
          // merge all original properties that are not already overridden
          Object.entries(definitionToMerge.properties)
            .filter(([propName]) => !Object.keys(toUpdateDefinition.properties).includes(propName))
            .forEach(([propName, prop]) => toUpdateDefinition.properties[propName] = prop);

          // merge required fields
          if (definitionToMerge.requires) {
            toUpdateDefinition.requires ||= [];
            toUpdateDefinition.requires.push(...definitionToMerge.requires.filter((def: string) => !toUpdateDefinition.requires.includes(def)));
          }

          // Bubble up final definition and remove allOf
          definition.properties = toUpdateDefinition.properties;
          definition.type = toUpdateDefinition.type;
          definition.required = toUpdateDefinition.required;
          definition.description = toUpdateDefinition.description || definitionToMerge.description;
          delete definition.allOf;

        // complex case: merge with several definition (potentially not an extension)
        } else {
          /** Definition to merge with the object  */
          const definitionObjToMerge = Object.entries(toFlattenDefinitions).find(([defName]) => definition.allOf!.some((item) => item.$ref && (item.$ref as string).endsWith(defName)));
          if (!definitionObjToMerge) {
            return;
          }
          const [definitionName, definitionToMerge] = definitionObjToMerge;

          /** Reference to the definition to update with the conflicted original definition */
          let toUpdateDefinition = Object.values<any>(definition.allOf).find((def) => !def.$ref);
          // Create an additional definition if only references under allOf
          if (!toUpdateDefinition) {
            toUpdateDefinition = {
              type: 'object',
              properties: {}
            };
            definition.allOf.push(toUpdateDefinition);
          }

          // merge all original properties that are not already overridden
          Object.entries(definitionToMerge.properties)
            .filter(([propName]) => !Object.keys(toUpdateDefinition.properties).includes(propName))
            .forEach(([propName, prop]) => toUpdateDefinition.properties[propName] = prop);

          // merge required fields
          if (definitionToMerge.requires) {
            toUpdateDefinition.requires ||= [];
            toUpdateDefinition.requires.push(...definitionToMerge.requires.filter((def: string) => !toUpdateDefinition.requires.includes(def)));
          }

          // removed reference to conflicted definition
          definition.allOf = definition.allOf.filter((def) => !def.$ref || !(def.$ref as string).endsWith(definitionName));
        }
      });

    // removed conflicted definitions
    Object.keys(toFlattenDefinitions)
      .forEach((def) => delete swaggerSpec.definitions[def]);

    return swaggerSpec;
  }
}
