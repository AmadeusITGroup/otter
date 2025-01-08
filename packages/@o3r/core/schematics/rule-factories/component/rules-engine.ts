import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  NgGenerateComponentSchematicsSchema,
} from '../../component/schema';
import {
  askQuestionsToGetRulesOrThrowIfPackageNotAvailable,
} from './common';

export const getAddRulesEngineRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useRulesEngine' | 'skipLinter' | 'projectName' | 'componentStructure'>
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useRulesEngine',
  options.useRulesEngine,
  'Generate component with rules-engine?',
  ['@o3r/core:component', '@o3r/core:component-container'],
  '@o3r/rules-engine',
  'rules-engine-to-component',
  {
    ...options,
    skipLinter: options.skipLinter,
    projectName: options.projectName
  }
);
