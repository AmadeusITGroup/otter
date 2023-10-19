import type { SchematicOptionObject } from '@o3r/schematics';

export type PresetNames = 'basic' | 'cms';

export interface NgAddSchematicsSchema extends SchematicOptionObject {
  /** Preset of module list to automatically install */
  preset: PresetNames;

  /** Project name */
  projectName?: string | undefined;

  /**
   * Enable otter customization
   * @deprecated will be removed in favor of preset feature
   */
  enableCustomization: boolean;

  /**
   * Enable otter analytics
   * @deprecated will be removed in favor of preset feature
   */
  enableAnalytics: boolean;

  /**
   * Enable otter styling
   * @deprecated will be removed in favor of preset feature
   */
  enableStyling: boolean;

   /**
    * Enable otter rules-engine
    * @deprecated will be removed in favor of preset feature
    */
  enableRulesEngine: boolean;

  /**
   * Enable localization
   * @deprecated will be removed in favor of preset feature
   */
  enableLocalization: boolean;

  /**
   * Enable configuration setup
   * @deprecated will be removed in favor of preset feature
   */
  enableConfiguration: boolean;

  /**
   * Enable Storybook
   * @deprecated will be removed in favor of preset feature
   */
  enableStorybook: boolean;

  /** Skip the linter process */
  skipLinter: boolean;

  /**
   * Generate the Azure Pipeline for the new project
   * @deprecated will be removed in favor of preset feature
   */
  generateAzurePipeline: boolean;

  /** Skip the install process */
  skipInstall: boolean;

  /**
   * Enable Apis manager
   * @deprecated will be removed in favor of preset feature
   */
  enableApisManager: boolean;
}
