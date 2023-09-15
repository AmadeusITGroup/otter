import { Rule, SchematicContext } from '@angular-devkit/schematics';
import { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';


export const getAddConfigurationRules = (
  componentPath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterConfig' | 'skipLinter' | 'projectName'> & Partial<Pick<NgGenerateComponentSchematicsSchema, 'componentStructure'>>,
  context: SchematicContext
): Promise<Rule[]> => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  componentPath,
  'useOtterConfig',
  options.useOtterConfig,
  'Generate component with Otter configuration?',
  ['@o3r/core:component', '@o3r/core:component-presenter', '@o3r/core:component-container'],
  context,
  '@o3r/configuration',
  'configuration-to-component',
  {
    skipLinter: options.skipLinter,
    projectName: options.projectName,
    exposeComponent: !!options.componentStructure && options.componentStructure !== 'full'
  }
);
