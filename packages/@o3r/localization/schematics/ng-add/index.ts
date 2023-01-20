import { chain, noop, Rule } from '@angular-devkit/schematics';
import { applyEsLintFix, install, ngAddPackages } from '@o3r/schematics';
import { updateI18n, updateLocalization } from '../localization-base';
import { NgAddSchematicsSchema } from './schema';


/**
 * Add Otter localization to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return chain([
    updateLocalization(options, __dirname),
    updateI18n(),
    options.skipLinter ? noop() : applyEsLintFix(),
    options.skipInstall ? noop : install,
    ngAddPackages(['@o3r/dynamic-content', '@o3r/logger', '@o3r/extractors', '@o3r/testing'], {skipConfirmation: true, parentPackageInfo: '@o3r/localization - setup'})
  ]);
}
