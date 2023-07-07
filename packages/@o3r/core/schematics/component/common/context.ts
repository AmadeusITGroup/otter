import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';

export const getAddContextRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useContext' | 'skipLinter'>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useContext',
  options.useContext,
  'Generate component with Otter context?',
  ['@o3r/core:component', '@o3r/core:component-container', '@o3r/core:component-presenter'],
  context,
  '@o3r/core',
  'context-to-component',
  {
    path: componentPath,
    skipLinter: options.skipLinter
  }
);
