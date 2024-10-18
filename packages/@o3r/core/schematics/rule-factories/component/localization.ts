import type {
  Rule
} from '@angular-devkit/schematics';
import type {
  NgGenerateComponentSchematicsSchema
} from '../../component/schema';
import {
  askQuestionsToGetRulesOrThrowIfPackageNotAvailable
} from './common';

export const getAddLocalizationRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useLocalization' | 'skipLinter' | 'activateDummy'>
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useLocalization',
  options.useLocalization,
  'Generate component with Otter localization?',
  ['@o3r/core:component', '@o3r/core:component-presenter', '@o3r/core:component-container'],
  '@o3r/localization',
  'localization-to-component',
  {
    ...options,
    skipLinter: options.skipLinter,
    activateDummy: options.activateDummy
  }
);
