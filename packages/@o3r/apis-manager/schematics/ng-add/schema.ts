import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Skip the install process */
  skipInstall: boolean;

  /** Use a pinned version for otter packages */
  exactO3rVersion?: boolean;

  /**
   * Skip the code sample generated in application to register the ApiManager
   * If `false`, a dependency to @ama-sdk/client-fetch will be added
   */
  skipCodeSample?: boolean;
}
