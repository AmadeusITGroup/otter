import {JsonObject} from '@angular-devkit/core';

export interface NgGenerateIframeComponentSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** name of the component to generate */
  componentName: string;

  /** Selector prefix */
  prefix: string | null;

  /** Description of the component generated */
  description: string | null;

  /** Component Folder */
  path: string | null;

  /** Use otter configuration */
  useOtterConfig: boolean;

  /** Skip the linter process */
  skipLinter: boolean;
}
