import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgAddConfigSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Path to the component */
  path: string;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Should change a component into an exposed component */
  exposeComponent: boolean;

  /** Should add a config signal instead of observable in the component */
  useSignal: boolean;
}
