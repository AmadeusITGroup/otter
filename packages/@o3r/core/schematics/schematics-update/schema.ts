import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateUpdateSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Version to apply the ngUpdate */
  version: string;

  /** Source directory containing the schematics */
  path?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;
}
