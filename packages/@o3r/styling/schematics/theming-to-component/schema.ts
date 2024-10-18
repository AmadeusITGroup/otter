import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgAddThemingSchematicsSchema extends SchematicOptionObject {
  /** Path to the component's style file */
  path: string;
}
