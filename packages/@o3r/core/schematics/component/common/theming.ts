import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';


export const getAddThemingRules = (
  stylePath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterTheming'>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  stylePath,
  'useOtterTheming',
  options.useOtterTheming,
  'Generate component with Otter theming?',
  ['@o3r/core:component', '@o3r/core:component-presenter'],
  context,
  '@o3r/styling',
  'theming-to-component'
);
