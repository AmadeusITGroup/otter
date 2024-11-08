import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGenerateApiExtensionSchematicsSchema extends SchematicOptionObject {
  /** Extension Name */
  name: string;
  /** Type of the core API to extend */
  coreType: 'private' | 'public';
  /** Version of the core API to extend */
  coreVersion: string;
}
