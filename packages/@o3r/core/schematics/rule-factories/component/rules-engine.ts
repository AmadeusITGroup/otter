import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';

export const getAddRulesEngineRules = async (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useRulesEngine' | 'skipLinter' | 'projectName' | 'componentStructure'>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useRulesEngine',
  options.useRulesEngine,
  'Generate component with rules-engine?',
  ['@o3r/core:component', '@o3r/core:component-container'],
  context,
  '@o3r/rules-engine',
  'rules-engine-to-component',
  {
    path: componentPath,
    skipLinter: options.skipLinter,
    projectName: options.projectName
  }
);
