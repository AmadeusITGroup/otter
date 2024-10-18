import type { SchematicOptionObject } from '@o3r/schematics';

export interface GenerateJsonSchemaSchematicsSchema extends SchematicOptionObject {
  /** Path patterns to the Design Token JSON files */
  designTokenFilePatterns: string | string[];

  /** Path to the outputted Json schema file. */
  output: string;

  /** File path to generate the variable if not determined by the specification */
  defaultStyleFile: string;

  /** Enable Watch mode */
  watch?: boolean;

  /** Root path of files where the CSS will be generated */
  rootPath?: string;

  /** Determine if the process should stop in case of Token duplication */
  failOnDuplicate?: boolean;

  /** Determine if the builder should fail if a missing Design Token reference is detected */
  failOnMissingReference?: boolean;

  /** ID used in the generated JSON Schema */
  schemaId?: string;

  /** Description of the generated JSON Schema */
  schemaDescription?: string;
}
