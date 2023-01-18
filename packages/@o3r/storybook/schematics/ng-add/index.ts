import { chain, noop, Rule } from '@angular-devkit/schematics';
import { applyEsLintFix, install } from '@o3r/schematics';
import { NgAddSchematicsSchema } from './schema';
import { updateStorybook } from '../storybook-base';
import { isPackageInstalled } from '@o3r/dev-tools';


/**
 * Add Otter storybook to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return chain([
    // if the package is already installed skip the updates on files to avoid overriding the existing configurations
    isPackageInstalled('@otter/storybook') || isPackageInstalled('@o3r/storybook') ? noop() : updateStorybook(options, __dirname),
    options.skipLinter ? noop() : applyEsLintFix(),
    options.skipInstall ? noop() : install
  ]);
}
