import type {
  Rule
} from '@angular-devkit/schematics';
import type {
  NgGenerateComponentSchematicsSchema
} from '../../component/schema';
import {
  askQuestionsToGetRulesOrThrowIfPackageNotAvailable
} from './common';

export const getAddContextRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useContext' | 'skipLinter'>
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useContext',
  options.useContext,
  'Generate component with Otter context?',
  ['@o3r/core:component', '@o3r/core:component-container', '@o3r/core:component-presenter'],
  '@o3r/core',
  'context-to-component',
  {
    ...options,
    skipLinter: options.skipLinter
  }
);
