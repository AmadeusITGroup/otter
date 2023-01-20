import { chain, Rule } from '@angular-devkit/schematics';
import { checkPackagesRule } from '@o3r/schematics';
import { NgAddSchematicsSchema } from './schema';
import { removeV7OtterAssetsInAngularJson, updateThemeFiles } from './theme-files';
import { updateO3rImports } from './updates-of-old-otter-scope/imports/update-imports-with-scope';
/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return chain([
    checkPackagesRule('@o3r/styling'),
    updateO3rImports('o3r'),
    updateThemeFiles(__dirname),
    removeV7OtterAssetsInAngularJson(options)
  ]);
}
