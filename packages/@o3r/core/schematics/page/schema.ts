import {JsonObject} from '@angular-devkit/core';

export interface NgGeneratePageSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Page name */
  name: string;

  /** Page scope */
  scope: string;

  /** Application routing module path */
  appRoutingModulePath: string;

  /** Selector prefix */
  prefix: string | null;

  /** Directory containing the pages */
  path: string | null;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Indicates if the page should use otter theming architecture */
  useOtterTheming: boolean;

  /** Indicates if the page should use otter configuration */
  useOtterConfig: boolean;

  /** Indicates if the page should use localization */
  useLocalization: boolean;
}
