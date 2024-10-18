import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface CreateModuleSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  name: string;

  /** Path where generate the repository */
  basePath: string;
}
