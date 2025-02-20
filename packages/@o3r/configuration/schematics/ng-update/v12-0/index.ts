import {
  chain,
  type Rule,
  type SchematicContext,
  type Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  type ImportsMapping,
  updateImports,
} from '@o3r/schematics';

/** Map containing the import and value changes for computeConfigurationName updated to computeItemIdentifier in @o3r/core */
const mapImportsConfigurationName: ImportsMapping = {
  '@o3r/configuration': {
    computeConfigurationName: {
      newPackage: '@o3r/core',
      newValue: 'computeItemIdentifier'
    }
  }
};

/**
 * Update of Otter library V12.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version is in the function name
function updateV12_0Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const updateRules: Rule[] = [
      updateImports(mapImportsConfigurationName)
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter configuration V12.0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- version in the function name
export const updateV12_0 = createOtterSchematic(updateV12_0Fn);
