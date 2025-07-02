import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddDesignTokenSchematicsSchema extends SchematicOptionObject {
  /** Path to the component's design token file */
  path: string;

  /** Path to the Style file to update */
  stylePath?: string;
}
