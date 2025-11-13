import type {
  SchematicOptionObject,
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

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Custom type to append to the service's file name */
  type?: string;

  /** Append the 'type' option to the generated class name */
  addTypeToClassName: boolean;
}
