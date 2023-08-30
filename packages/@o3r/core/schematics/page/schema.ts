import type { SchematicOptionObject } from '@o3r/schematics';

export interface NgGeneratePageSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Page name */
  name: string;

  /** Page scope */
  scope: string;

  /** Application routing module path */
  appRoutingModulePath: string;

  /** Selector prefix */
  prefix?: string | undefined;

  /** Directory containing the pages */
  path?: string | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Indicates if the page should use otter theming architecture */
  useOtterTheming: boolean;

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
}
