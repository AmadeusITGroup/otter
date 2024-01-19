import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;
  /** Extract the design token from Sass file in the project */
  extractDesignToken?: boolean;
}
