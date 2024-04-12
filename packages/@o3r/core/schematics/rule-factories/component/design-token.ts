import type { Rule } from '@angular-devkit/schematics';
import type { NgGenerateComponentSchematicsSchema } from '../../component/schema';
import { askQuestionsToGetRulesOrThrowIfPackageNotAvailable } from './common';

export const getAddDesignTokenRules = (
  designTokenPath: string,
  stylePath: string,
  options: Pick<NgGenerateComponentSchematicsSchema, 'useOtterDesignToken'>
): Rule => askQuestionsToGetRulesOrThrowIfPackageNotAvailable(
  designTokenPath,
  'useOtterDesignToken',
  options.useOtterDesignToken,
  'Generate component with Design Token specification?',
  ['@o3r/core:component', '@o3r/core:component-presenter'],
  '@o3r/design',
  'design-token-to-component',
  {
    ...options,
    stylePath
  }
);
