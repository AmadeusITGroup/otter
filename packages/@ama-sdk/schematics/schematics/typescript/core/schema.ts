import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateTypescriptSDKCoreSchematicsSchema extends SchematicOptionObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Directory where to generate the SDK */
  directory?: string | undefined;

  /** Package manager to be used in the generated SDK */
  packageManager: 'npm' | 'yarn' | undefined;

  /** Path to the spec generation configuration */
  specConfigPath: string | undefined;

  /**
   * Comma separated string of options to give to the openapi-generator-cli
   * @example To log the full json structure used to generate models
   * ```typescript
   * 'debugModule'
   * ```
   * @example To log the full json structure used to generate operations
   * ```typescript
   * 'debugOperations'
   * ```
   * @default ''
   */
  globalProperty: string | undefined;
}
