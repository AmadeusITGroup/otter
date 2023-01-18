import { chain, noop, Rule } from '@angular-devkit/schematics';
import { isPackageInstalled } from '@o3r/dev-tools';
import { applyEsLintFix, install, ngAddPackages } from '@o3r/schematics';
import { updateI18n, updateLocalization } from '../localization-base';
import { NgAddSchematicsSchema } from './schema';


/**
 * Add Otter localization to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  // if the package is already installed skip the updates on files to avoid overriding the existing configurations
  const locUpdates = isPackageInstalled('@otter/core') || isPackageInstalled('@o3r/localization') ? [noop()] : [updateLocalization(options, __dirname), updateI18n()];
  return chain([
    ...locUpdates,
    ngAddPackages(['@o3r/dynamic-content', '@o3r/logger', '@o3r/extractors', '@o3r/testing'], {skipConfirmation: true}),
    options.skipLinter ? noop() : applyEsLintFix(),
    options.skipInstall ? noop : install
  ]);
}
