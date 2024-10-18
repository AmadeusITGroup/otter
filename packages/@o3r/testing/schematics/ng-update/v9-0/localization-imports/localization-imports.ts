import {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  updateImports
} from '@o3r/schematics';
import {
  mapImportLocalizationMocks
} from './localization-imports-map';

/**
 * update of o3r localization imports mocks
 */
export function updateLocalizationImports(): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    // this will double-check that the imports of mocks related to localization are targeting the sub-entry @o3r/testing/localization

    return updateImports(mapImportLocalizationMocks, undefined, true);
  };
}
