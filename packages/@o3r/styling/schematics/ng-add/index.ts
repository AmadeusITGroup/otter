import { chain, noop, Rule } from '@angular-devkit/schematics';
import { isPackageInstalled } from '@o3r/dev-tools';
import { NgAddSchematicsSchema } from './schema';
import { updateStyling } from './theme-files';
import { updateO3rImports } from './updates-of-old-otter-scope/imports/update-imports-with-scope';
import { checkPackagesRule } from '@o3r/schematics';
/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return chain([
    checkPackagesRule('@o3r/styling'),
    updateO3rImports('o3r'),
    // add styling theme files and updates in angular.json only if we have a new project whithout otter or o3r
    isPackageInstalled('@otter/styling') || isPackageInstalled('@o3r/styling') ? noop() : updateStyling(options, __dirname)
  ]);
}
