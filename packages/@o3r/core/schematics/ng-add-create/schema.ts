import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateUpdateSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  name?: string | undefined;

  /** Source directory containing the schematics */
  path?: string | undefined;

}
