import type {
  Rule
} from '@angular-devkit/schematics';
import type {
  NgGenerateComponentSchematicsSchema
} from '../../component/schema';
import {
  askQuestionsToGetRulesOrThrowIfPackageNotAvailable
} from './common';

export const getAddFixtureRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useComponentFixtures' | 'skipLinter'>,
  isPage = false
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useComponentFixtures',
  options.useComponentFixtures,
  'Generate component with Otter fixture?',
  ['@o3r/core:component', '@o3r/core:component-presenter', '@o3r/core:component-container'],
  '@o3r/testing',
  'fixture-to-component',
  {
    ...options,
    skipLinter: options.skipLinter,
    page: isPage
  }
);
