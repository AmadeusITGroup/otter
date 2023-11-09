import type { Rule } from '@angular-devkit/schematics';
import type { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';

export const getAddThemingRules = (
  stylePath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterTheming'>
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  stylePath,
  'useOtterTheming',
  options.useOtterTheming,
  'Generate component with Otter theming?',
  ['@o3r/core:component', '@o3r/core:component-presenter'],
  '@o3r/styling',
  'theming-to-component'
);
