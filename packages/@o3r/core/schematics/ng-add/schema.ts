import type { JsonObject } from '@angular-devkit/core';

export interface NgAddSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Enable localization */
  enableLocalization: boolean;

  /** Enable Storybook */
  enableStorybook: boolean;

  /** Install NPM links to work on Otter Library */
  isSymlinksNeeded: boolean;

  /** Set the Otter Generator as default ngCLI generator */
  isDefaultGenerator: boolean;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Generate the Azure Pipeline for the new project */
  generateAzurePipeline: boolean;
}
