import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGeneratePageSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Page name */
  name: string;

  /** Page scope */
  scope: string;

  /** Application routing module path */
  appRoutingModulePath?: string | undefined;

  /** Selector prefix */
  prefix?: string | undefined;

  /** Directory containing the pages */
  path?: string | undefined;

  /** Skip the linter process which includes the run of EsLint and EditorConfig rules */
  skipLinter: boolean;

  /** Indicates if the page should use otter configuration */
  useOtterConfig: boolean;

  /** Indicates if the page should use localization */
  useLocalization: boolean;

  /** Whether the generated component is standalone */
  standalone: boolean;

  /** Generate page fixtures for tests */
  usePageFixtures: boolean;

  /** Generate dummy values */
  activateDummy: boolean;

  /** Custom type to append to the page's file name */
  type?: string;
}
