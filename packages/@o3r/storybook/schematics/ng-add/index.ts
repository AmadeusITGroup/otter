import { chain, noop, Rule } from '@angular-devkit/schematics';
import { applyEsLintFix, install } from '@o3r/schematics';
import { NgAddSchematicsSchema } from './schema';
import { updateStorybook } from '../storybook-base';

/**
 * Add Otter storybook to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return chain([
    updateStorybook(options, __dirname),
    options.skipLinter ? noop() : applyEsLintFix(),
    options.skipInstall ? noop() : install
  ]);
}
