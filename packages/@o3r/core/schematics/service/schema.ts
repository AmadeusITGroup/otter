import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGenerateServiceSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Service name */
  name: string;

  /** Name of the service feature */
  featureName: string;

  /** Directory containing the services */
  path?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;
}
