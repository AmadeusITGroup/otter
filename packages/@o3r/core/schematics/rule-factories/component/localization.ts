import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';


export const getAddLocalizationRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useLocalization' | 'skipLinter' | 'activateDummy'>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useLocalization',
  options.useLocalization,
  'Generate component with Otter localization?',
  ['@o3r/core:component', '@o3r/core:component-presenter', '@o3r/core:component-container'],
  context,
  '@o3r/localization',
  'localization-to-component',
  {
    skipLinter: options.skipLinter,
    activateDummy: options.activateDummy
  }
);
