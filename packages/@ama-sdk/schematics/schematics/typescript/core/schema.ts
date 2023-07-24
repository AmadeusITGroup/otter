import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends SchematicOptionObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Directory where to generate the SDK */
  directory: string | undefined;

  /** Package manager to be used in the generated SDK */
  packageManager: 'npm' | 'yarn' | '';

  /** Path to the spec generation configuration */
  specConfigPath: string | undefined;
}
