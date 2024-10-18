import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGeneratePlaywrightSanitySchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Page name */
  name: string;

  /** Directory containing the playwright sanity */
  path?: string | undefined;
}
