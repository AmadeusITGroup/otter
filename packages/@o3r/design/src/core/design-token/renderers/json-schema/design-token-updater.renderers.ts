import type { DesignContentFileUpdater } from '../design-token.renderer.interface';

/** Options for {@link getJsonSchemaStyleContentUpdater} */
export interface JsonSchemaStyleContentUpdaterOptions {
  /** Description to the JSON Schema generated */
  description?: string;
  /** ID of the JSON Schema generated */
  id?: string;
}

/**
 * Retrieve a Content Updater function for Json Schema generator
 * @param options
 */
export const getJsonSchemaStyleContentUpdater = (options?: JsonSchemaStyleContentUpdaterOptions): DesignContentFileUpdater => {
  return (variables: string[]) => {
    return JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: options?.description,
      $id: options?.id,
      additionalItems: true,
      ...JSON.parse(`{"allOf": [${variables.join(',')}]}`)
    }, null, 2);
  };
};
