import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';


export const getAddFixtureRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useComponentFixtures' | 'skipLinter'>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useComponentFixtures',
  options.useComponentFixtures,
  'Generate component with Otter fixture?',
  ['@o3r/core:component', '@o3r/core:component-presenter', '@o3r/core:component-container'],
  context,
  '@o3r/testing',
  'fixture-to-component',
  {
    skipLinter: options.skipLinter
  }
);
