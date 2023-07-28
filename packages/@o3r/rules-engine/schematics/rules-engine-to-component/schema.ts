import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGenerateRulesEngineToComponentSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName: string | undefined;

  /** Component Folder */
  path: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;
}
