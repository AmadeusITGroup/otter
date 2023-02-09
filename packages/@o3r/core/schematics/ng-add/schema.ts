import type { JsonObject } from '@angular-devkit/core';

export interface NgAddSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** Enable prefetch builder */
  enablePrefetchBuilder: boolean;

  /** Enable playwright */
  enablePlaywright: boolean;

  /** Enable otter customization */
  enableCustomization: boolean;

  /** Enable otter analytics */
  enableAnalytics: boolean;

  /** Enable otter styling */
  enableStyling: boolean;

   /** Enable otter rules-engine */
  enableRulesEngine: boolean;

  /** Enable CMS */
  enableCms: boolean;

  /** Enable localization */
  enableLocalization: boolean;

  /** Enable configuration setup */
  enableConfiguration: boolean;

  /** Enable Storybook */
  enableStorybook: boolean;

  /** Set the Otter Generator as default ngCLI generator */
  isDefaultGenerator: boolean;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Generate the Azure Pipeline for the new project */
  generateAzurePipeline: boolean;

  /** Testing framework */
  testingFramework: 'jest' | 'jasmine';

  /** Skip the install process */
  skipInstall: boolean;

  /** Enable Apis manager */
  enableApisManager: boolean;
}
