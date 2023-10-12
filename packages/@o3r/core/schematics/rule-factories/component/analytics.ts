import type { Rule } from '@angular-devkit/schematics';
import type { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';

export const getAddAnalyticsRules = (
  componentPath: string,
  options: NgGenerateComponentSchematicsSchema
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useOtterAnalytics',
  options.useOtterAnalytics,
  'Generate component with Otter analytics?',
  ['@o3r/core:component', '@o3r/core:component-presenter'],
  '@o3r/analytics',
  'analytics-to-component',
  {
    skipLinter: options.skipLinter,
    activateDummy: options.activateDummy
  }
);
